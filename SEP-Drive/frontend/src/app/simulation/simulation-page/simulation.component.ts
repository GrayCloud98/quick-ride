import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Control, SimulationService, Update} from '../simulation.service';
import {MatDialog} from '@angular/material/dialog';
import {RatingPopupComponent} from '../rating-popup/rating-popup.component';

@Component({
  selector: 'simulation-page',
  standalone: false,
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: google.maps.Map;
  pointer!: google.maps.marker.AdvancedMarkerElement;
  animationFrameId: number | null = null;
  path: google.maps.LatLngLiteral[] = [];

  currentIndex = 0;
  points: google.maps.LatLngLiteral[] = [];
  duration = 30;
  isRunning = false;
  isPaused = false;
  metadataLoaded = false;

  private pins: google.maps.marker.AdvancedMarkerElement[] = [];
  private directionsRenderer?: google.maps.DirectionsRenderer;

  constructor(private dialog: MatDialog,
              private simService: SimulationService) {}

  ngAfterViewInit(): void {
    this.simService.connect();

    this.simService.getSimulationUpdates().subscribe(
      (update: Update) => {
        console.log("🎁", update); // FIXME DELETE

        this.duration = update.duration;
        this.currentIndex = update.currentIndex;
        this.points = [ update.startPoint, update.endPoint ];

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

  private initializeMap(): void {
    const mapOptions: google.maps.MapOptions = {
      center: this.points[0],
      zoom: 6,
      mapId: 'DEMO_MAP_ID'
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
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
    if (this.directionsRenderer) this.directionsRenderer.setMap(null);

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

    this.pointer = new google.maps.marker.AdvancedMarkerElement({
      position: this.path[this.currentIndex],
      map: this.map,
      title: 'Moving pointer',
      content: this.createCar()
    });
  }

  private animate(): void {
    const totalSteps = this.path.length;
    const totalDurationMs = this.duration * 1000; // duration in milliseconds
    const startTime = performance.now();
    const startIndex = this.currentIndex;

    const step = (currentTime: number) => {
      if (!this.isRunning || this.isPaused) return;

      const elapsed = currentTime - startTime;
      const progressRatio = elapsed / totalDurationMs;

      this.currentIndex = Math.floor(startIndex + totalSteps * progressRatio);
      this.pointer.position = this.path[Math.min(this.currentIndex, totalSteps - 1)];

      if (this.currentIndex >= totalSteps - 1) {
        this.pointer.position = this.path[totalSteps - 1];
        this.isRunning = false;
        return;
      }

      this.animationFrameId = requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
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
    this.simService.control(Control.COMPLETE);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  protected readonly console = console;

  rate(rate: number) {
    this.simService.rate(rate).subscribe({
      next: res => console.warn('rate ✅', res),
      error: err => console.error('rate ❌', err)
    });
  }

  addStopover() {
    const newPoint = { lat: 53.5511, lng: 9.9937 };
    this.points.splice(1, 0, newPoint);

    this.renderPins();
    this.drawRoute();
  }

  openRating() {
    this.dialog.open(RatingPopupComponent, { disableClose: true })
      .afterClosed()
      .subscribe(rating => {
        if (rating) {
          console.log('User selected rating:', rating);
        }
      });
  }
}
