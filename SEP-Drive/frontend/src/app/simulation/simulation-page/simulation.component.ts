import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Control, SimulationService, Update } from '../simulation.service';
import { MatDialog } from '@angular/material/dialog';
import { RatingPopupComponent } from '../rating-popup/rating-popup.component';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '../../ride/models/location.model';
import { DistanceService} from '../../ride/services/distance.service';
import { VehicleClass } from '../../ride/models/ride.model';

interface Point {
  name?: string, //todo new
  address?: string, //todo new
  lat: number,
  lng: number,
  index: number,
  passed: boolean //todo new
}

@Component({
  selector: 'simulation-page',
  standalone: false,
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent implements AfterViewInit, OnDestroy {
  // 🗺️ Map and Animation
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;
  private pointer!: google.maps.marker.AdvancedMarkerElement;
  private animationFrameId: number | null = null;
  private directionsRenderer?: google.maps.DirectionsRenderer;
  private pins: google.maps.marker.AdvancedMarkerElement[] = [];
  private path: google.maps.LatLngLiteral[] = [];

  // 🚘 Route/Stopovers State
  // points: google.maps.LatLngLiteral[] = []; // todo uncomment
  ride = {vehicleClass: VehicleClass.LARGE, distance: 0, duration: 0, estimatedPrice: 0} //todo new
  points: Point[] = [ { lat: 52.52, lng: 13.405, passed: true, index: 0, name: 'Berlin', address: 'Berlin, Germany' }, { lat: 53.5511, lng: 9.9937, passed: false, index: 1, name: 'Hamburg', address: 'Hamburg, Germany' }, { lat: 51.3397, lng: 12.3731, passed: false, index: 2, name: 'Leipzig', address: 'Leipzig, Germany' }, { lat: 48.1351, lng: 11.582, passed: false, index: 3, name: 'Munich', address: 'Munich, Germany' } ];
  currentIndex = 0;
  duration = 30;
  nextStopoverPosition = 1; //todo new
  desiredStopoverPosition = 1; //todo new

  // ⏱️ State Flags
  isRunning = false;
  isPaused = true;
  hasCompleted = false;
  metadataLoaded = false;

  // 🧩 Form Controls
  newStopoverControl = new FormControl<Location | string>('', [Validators.required]);

  // 🛠️ Constructor
  constructor(private dialog: MatDialog,
              private distanceService: DistanceService,
              private simService: SimulationService) {}

  // 🔄 Lifecycle
  ngAfterViewInit(): void {
    this.simService.connect();
    this.initializeMap(); // todo delete
    this.simService.getSimulationUpdates().subscribe(
      (update: Update) => {
        console.log("🎁", update);

        this.duration = update.duration;
        this.currentIndex = update.currentIndex;
        // this.points = [ update.startPoint, update.endPoint ]; //todo uncomment

        if (update.rideStatus === 'COMPLETED' && !this.hasCompleted) {
          this.complete();
          return;
        }

        if (update.hasStarted !== this.isRunning || update.paused !== this.isPaused) {
          if (update.hasStarted) {
            if (!this.isRunning) this.start();
            else if (update.paused) this.pause();
            else if (!update.paused) this.resume();
          }

          this.isRunning = update.hasStarted;
          this.isPaused = update.paused;
        }

        if (!this.metadataLoaded) {
          this.metadataLoaded = true;
          this.initializeMap();
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
    void this.updateRideInfo(); // todo retrieve from back end on init
    this.renderPins();
    this.drawRoute();
  }

  private renderPins(): void {
    this.pins.forEach(marker => marker.map = null);
    this.pins = [];

    this.points.forEach((position, index) => {
      let color = 'blue';
      if (index === 0) color = 'darkgreen';
      else if (index === this.points.length - 1) color = 'red';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position,
        title: `Point ${index + 1}`,
        content: this.createPin(color)
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

    this.pointer = new google.maps.marker.AdvancedMarkerElement({
      position: this.path[this.currentIndex],
      map: this.map,
      title: 'Moving pointer',
      content: this.createCar()
    });
  }

  private animate(): void {
    const totalSteps = this.path.length;
    const totalDurationMs = this.duration * 1000;
    const startTime = performance.now();
    const startIndex = this.currentIndex;

    const step = (currentTime: number) => {
      if (!this.isRunning || this.isPaused) return;

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
        this.isPaused = true;
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
    this.isRunning = true;
    this.isPaused = false;
    this.animate();
    this.simService.control(Control.START, this.currentIndex);
  }

  pause(): void {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.simService.control(Control.PAUSE, this.currentIndex);
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
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
    if (this.points[this.points.length - 1].passed)
      this.points.splice(this.desiredStopoverPosition, 0, newStopover);

    else if (this.isRunning && this.desiredStopoverPosition === this.nextStopoverPosition) {
      const currentPoint: Point = { name: 'Midway Point', address: 'undefined', lat: this.path[this.currentIndex].lat, lng: this.path[this.currentIndex].lng, passed: true, index: this.currentIndex };
      this.points.splice(this.desiredStopoverPosition, 0, currentPoint, newStopover);
      this.nextStopoverPosition += 1;
      this.desiredStopoverPosition += 1;
    }

    else
      this.points.splice(this.desiredStopoverPosition, 0, newStopover);

    void this.updateRideInfo();
    this.renderPins();
    this.drawRoute();
  }

  removeStopover(index: number) {
    if (this.isRunning && index === this.nextStopoverPosition) {
      const currentPoint: Point = { name: 'Midway Point', address: 'undefined', lat: this.path[this.currentIndex].lat, lng: this.path[this.currentIndex].lng, passed: true, index: this.currentIndex };
      this.points.splice(index, 1, currentPoint);
      this.nextStopoverPosition += 1;
    } else
      this.points.splice(index, 1);

    void this.updateRideInfo();
    this.renderPins();
    this.drawRoute();
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

  private createPin(color: string): HTMLElement {
    const pin = document.createElement('pin');
    pin.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`;
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

  protected readonly console = console; // todo delete me

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

    this.ride.distance = totalDistance;
    this.ride.duration = totalDuration;
    this.ride.estimatedPrice = totalEstimatedPrice;
  }
}
