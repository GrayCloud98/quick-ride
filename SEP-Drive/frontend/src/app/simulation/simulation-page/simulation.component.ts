import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Control, SimulationService, Update} from '../simulation.service';
import {MatDialog} from '@angular/material/dialog';
import {RatingPopupComponent} from '../rating-popup/rating-popup.component';
import {FormControl, Validators} from '@angular/forms';
import {Location} from '../../ride/models/location.model';
import {DistanceService} from '../../ride/services/distance.service';
import {VehicleClass} from '../../ride/models/ride.model';
import {AuthService} from '../../auth/auth.service';

export interface Point {
  name?: string,
  address?: string,
  lat: number,
  lng: number,
  index: number,
  passed: boolean
}

@Component({
  selector: 'simulation-page',
  standalone: false,
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent implements OnInit, AfterViewInit, OnDestroy {
  // 🗺️ Map and Animation
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;
  private pointer!: google.maps.marker.AdvancedMarkerElement;
  private animationFrameId: number | null = null;
  private directionsRenderer?: google.maps.DirectionsRenderer;
  private pins: google.maps.marker.AdvancedMarkerElement[] = [];
  path: google.maps.LatLngLiteral[] = [];

  // 🚘 Route/Stopovers State
  points: Point[] = [];
  ride = {vehicleClass: VehicleClass.LARGE, estimatedDistance: 0, estimatedDuration: 0, estimatedPrice: 0}
  currentIndex = 0;
  duration = 30;
  nextStopoverPosition = 1;
  desiredStopoverPosition = 1;

  // ⏱️ State Flags
  hasStarted = false;
  hasCompleted = false;
  paused = true;
  metadataLoaded = false;

  // 🧩 Form Controls
  newStopoverControl = new FormControl<Location | string>('', [Validators.required]);
  isCustomer: boolean | null = null;
  userHasActiveSimulation: boolean | null = null;

  // 🛠️ Constructor
  constructor(private dialog: MatDialog,
              private authService: AuthService,
              private distanceService: DistanceService,
              private simService: SimulationService) {}

  ngOnInit(): void {
    if(this.authService.currentUserValue) {
      this.isCustomer = this.authService.currentUserValue.role === 'Customer'
      this.simService.activeSimulationStatus$.subscribe({
        next: status => this.userHasActiveSimulation = status
      })
    }
  }

  // 🔄 Lifecycle
  ngAfterViewInit(): void {
    this.simService.connect();

    this.simService.getSimulationUpdates().subscribe(
      (update: Update) => {
        this.duration = update.duration;
        this.currentIndex = update.currentIndex;

        if (update.hasChanged || !this.metadataLoaded) {
          this.points = [
            { name: update.startLocationName, address: update.startAddress, lat: update.startPoint.lat, lng: update.startPoint.lng, index: 0, passed: true },
            ...update.waypoints.map(wp => ({ name: wp.name, address: wp.address, lat: wp.latitude, lng: wp.longitude, index: 0, passed: false })),
            { name: update.destinationLocationName, address: update.destinationAddress, lat: update.endPoint.lat, lng: update.endPoint.lng, index: 0, passed: false }
          ];
        }

        if (update.rideStatus === 'COMPLETED' && !this.hasCompleted) {
          this.complete();
          return;
        }

        if (!this.hasStarted && update.hasStarted){
          this.start();
          this.hasStarted = true;
        }
        else if (update.hasChanged){
          void this.updateRideInfo();
          this.renderPins()
          this.drawRoute()
        }
        else {
          if (this.paused !== update.paused) {
            if (update.paused)
              this.pause();
            else
              this.resume();
            this.paused = update.paused;
          }
        }

        if (!this.metadataLoaded) {
          this.initializeMap();
          this.metadataLoaded = true;
        }
      }
    );
  }

  async ngOnDestroy(): Promise<void> {
    await this.simService.disconnect();
  }

  // 🗺️ Map Setup
  private initializeMap(): void {
    const mapOptions: google.maps.MapOptions = {
      center: this.points[0],
      zoom: 6,
      mapId: 'DEMO_MAP_ID'
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    void this.updateRideInfo();
    this.renderPins();
    this.drawRoute();
  }

  private renderPins(): void {
    this.pins.forEach(marker => marker.map = null);
    this.pins = [];

    this.points.forEach((point, index) => {
      let type: 'pickup' | 'dropoff' | 'stopover' = 'stopover';

      if (index === 0) type = 'pickup';
      else if (index === this.points.length - 1) type = 'dropoff';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: point,
        title: point.name,
        content: this.createStyledMarker(type, index)
      });
      this.pins.push(marker);
    });
  }


  private drawRoute(): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.pointer.map = null;
    }

    const directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });

    const start = this.points[0];
    const end = this.points[this.points.length - 1];
    const waypoints = this.points.slice(1, this.points.length - 1).map(p => ({
      location: p,
      stopover: true
    }));

    directionsService.route(
      {
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer!.setDirections(result);
          this.animateAlongRoute(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }

  private animateAlongRoute(result: google.maps.DirectionsResult): void {
    this.path = [];

    const legs = result.routes[0].legs;
    for (const leg of legs) {
      for (const step of leg.steps) {
        const stepPath = step.path.map(latlng => ({
          lat: latlng.lat(),
          lng: latlng.lng()
        }));
        this.path.push(...stepPath);
      }
    }

    this.assignStopoverIndices();
    this.points.forEach(p => p.passed = p.index <= this.currentIndex);
    this.nextStopoverPosition = this.points.findIndex(p => !p.passed);
    this.nextStopoverPosition = this.nextStopoverPosition === -1 ? this.points.length : this.nextStopoverPosition;
    this.desiredStopoverPosition = Math.max(this.desiredStopoverPosition, this.nextStopoverPosition);

    this.pointer = new google.maps.marker.AdvancedMarkerElement({
      position: this.path[this.currentIndex],
      map: this.map,
      title: 'You',
      content: this.createCar()
    });
  }

  private animate(): void {
    const totalSteps = this.path.length;
    const totalDurationMs = this.duration * 1000;
    const startTime = performance.now();
    const startIndex = this.currentIndex;

    const step = (currentTime: number) => {
      if (!this.hasStarted || this.paused) return;

      const elapsed = currentTime - startTime;
      const progressRatio = elapsed / totalDurationMs;

      this.currentIndex = Math.floor(startIndex + totalSteps * progressRatio);
      this.pointer.position = this.path[Math.min(this.currentIndex, totalSteps - 1)];

      this.points.forEach(
        point => {
          if (!point.passed && this.currentIndex >= point.index) {
            point.passed = true;
            this.nextStopoverPosition += 1;
            if (this.desiredStopoverPosition < this.nextStopoverPosition) this.desiredStopoverPosition += 1;
          }
        }
      );

      if (this.currentIndex >= totalSteps - 1) {
        this.pointer.position = this.path[totalSteps - 1];
        this.simService.control(Control.PAUSE, this.currentIndex)
        return;
      }

      this.animationFrameId = requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  // 🚗 Simulation Controls
  start(): void {
    if (!this.path.length) return;

    this.currentIndex = 0;
    this.hasStarted = true;
    this.paused = false;
    this.animate();
    this.simService.control(Control.START, this.currentIndex);
  }

  pause(): void {
    this.paused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.simService.control(Control.PAUSE, this.currentIndex);
  }

  resume(): void {
    if (!this.hasStarted || !this.paused) return;

    this.paused = false;
    this.animate();
    this.simService.control(Control.RESUME, this.currentIndex);
  }

  speed(): void {
    this.simService.control(Control.SPEED, this.duration);
  }

  complete(): void {
    if (this.hasCompleted) return;
    this.hasCompleted = true;

    const firstNotPassedIndex = this.points.findIndex(p => !p.passed);
    if (firstNotPassedIndex !== -1) {
      this.points.splice(firstNotPassedIndex);
      const currentPoint: Point = { name: 'Midway Point', address: 'undefined', lat: this.path[this.currentIndex].lat, lng: this.path[this.currentIndex].lng, passed: true, index: this.currentIndex };
      this.points.push(currentPoint);

      void this.updateRideInfo();
      this.renderPins();
      this.drawRoute();
    }

    this.simService.control(Control.COMPLETE);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.openRating();
  }

  // ⭐ Rating
  private openRating() {
    this.dialog.open(RatingPopupComponent, { disableClose: true }).afterClosed().subscribe();
  }

  // ➕ Stopover Management
  onLocationSelected(loc: Location) {
    this.newStopoverControl.setValue(loc);
    const newPoint: Point = {
      name: loc.name,
      address: loc.address,
      lat: loc.latitude,
      lng: loc.longitude,
      index: 0,
      passed: false
    };
    this.addStopover(newPoint);
  }

  private addStopover(newStopover: Point) {
    if(this.currentIndex >= this.path.length - 1)
      this.points.push(newStopover);

    else if (this.hasStarted && this.desiredStopoverPosition === this.nextStopoverPosition) {
      const currentPoint: Point = { name: 'Midway Point', address: 'undefined', lat: this.path[this.currentIndex].lat, lng: this.path[this.currentIndex].lng, passed: true, index: this.currentIndex };
      this.points.splice(this.desiredStopoverPosition, 0, currentPoint, newStopover);
    }

    else
      this.points.splice(this.desiredStopoverPosition, 0, newStopover);

    this.simService.control(Control.CHANGE, this.currentIndex, this.points, this.ride.estimatedDistance, this.ride.estimatedDuration);
  }

  removeStopover(index: number) {
    const currentPoint: Point = { name: 'Midway Point', address: 'undefined', lat: this.path[this.currentIndex].lat, lng: this.path[this.currentIndex].lng, passed: true, index: this.currentIndex };

    if (this.hasStarted && index === this.nextStopoverPosition)  {
      this.points.splice(index, 1, currentPoint);
      this.nextStopoverPosition += 1;
    }
    else if (index === this.points.length)
      this.points.splice(index - 1, 1, currentPoint);
    else
      this.points.splice(index, 1);

    this.simService.control(Control.CHANGE, this.currentIndex, this.points, this.ride.estimatedDistance, this.ride.estimatedDuration);
  }

  // 🧮 Helpers
  private assignStopoverIndices() {
    this.points.forEach(point => {
      let closestIndex = 0;
      let minDist = Number.MAX_VALUE;
      this.path.forEach((p, i) => {
        const dist = Math.hypot(p.lat - point.lat, p.lng - point.lng);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = i;
        }
      });
      point.index = closestIndex;
    });
  }

  private createStyledMarker(type: 'pickup' | 'dropoff' | 'stopover', index: number): HTMLElement {
    const pin = document.createElement('div');

    let svg;
    if (type === 'pickup')
      svg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="20" cy="20" r="18" fill="limegreen" stroke="white" stroke-width="3"/> <polygon points="16,13 28,20 16,27" fill="white"/> </svg>`;
    else if (type === 'dropoff')
      svg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="20" cy="20" r="18" fill="tomato" stroke="white" stroke-width="3"/> <path d="M14 27 L14 13 L28 16 L28 24 Z" fill="white" stroke="white" stroke-width="1"/> </svg>`;
    else
      svg = `<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"> <circle cx="18" cy="18" r="16" fill="#14B8A6" stroke="white" stroke-width="3"/> <text x="18" y="23" text-anchor="middle" fill="white" font-size="14" font-family="Arial" font-weight="bold">${index}</text> </svg>`;

    pin.innerHTML = svg;
    pin.style.position = 'absolute';
    pin.style.transform = 'translate(-50%, -50%)';
    return pin;
  }

  private createCar(): HTMLElement {
    const car = document.createElement('car');
    car.innerText = '🚗';
    car.style.fontSize = '35px';
    car.style.position = 'absolute';
    car.style.transform = 'translate(-50%, -50%)';
    return car;
  }

  async updateRideInfo(): Promise<void> {
    if (this.points.length < 2) return;

    let totalDistance = 0;
    let totalDuration = 0;
    let totalEstimatedPrice = 0;

    for (let i = 0; i < this.points.length - 1; i++) {
      const origin = { lat: this.points[i].lat, lng: this.points[i].lng };
      const destination = { lat: this.points[i + 1].lat, lng: this.points[i + 1].lng };

      try {
        const res = await this.distanceService.getDistanceDurationAndPrice(origin, destination, this.ride.vehicleClass);
        totalDistance += res.distance;
        totalDuration += res.duration;
        totalEstimatedPrice += res.estimatedPrice;
      } catch (err) {
        console.error(`Distance API error between point ${i} and ${i + 1}`, err);
      }
    }

    this.ride.estimatedDistance = totalDistance;
    this.ride.estimatedDuration = totalDuration;
    this.ride.estimatedPrice = totalEstimatedPrice;
  }
}
