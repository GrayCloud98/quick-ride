import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Control, SimService, Update} from '../sim.service';

@Component({
  selector: 'simulation',
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

  constructor(private simService: SimService) {}

  ngAfterViewInit(): void {
    this.simService.connect();

    this.simService.getSimulationUpdates().subscribe(
      (update: Update) => {
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
    this.renderMarkers();
    this.drawRoute();
  }

  private renderMarkers(): void {
    this.points.forEach((position, index) => {
      let color = 'blue';
      if (index === 0) color = 'darkgreen';
      else if (index === this.points.length - 1) color = 'red';

      new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position,
        title: `Point ${index + 1}`,
        content: this.createColoredMarker(color)
      });
    });
  }

  private drawRoute(): void {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });

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
          directionsRenderer.setDirections(result);
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
      content: this.createPointerElement()
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

  private createColoredMarker(color: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`;
    return div;
  }

  private createPointerElement(): HTMLElement {
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
    this.simService.control(this.currentIndex, Control.START);
  }

  pause(): void {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.simService.control(this.currentIndex, Control.PAUSE);
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.animate();
    this.simService.control(this.currentIndex, Control.RESUME);
  }

  speed(): void {
    this.simService.control(this.duration, Control.SPEED);
  }

  end(): void {
    // TODO END LOGIC
    console.log('Simulation ended.');
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  protected readonly console = console;
}
