import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

interface Point{
  label: string;
  title: string;
  position: { lat: number; lng: number; }
}
@Component({
  selector: 'simulation',
  standalone: false,
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: google.maps.Map;
  points: Point[] = [
    { label: 'S', title: 'Start (Berlin)', position: { lat: 52.52, lng: 13.405 } },
    { label: 'W1', title: 'Waypoint 1 (Hamburg)', position: { lat: 53.5511, lng: 9.9937 } },
    { label: 'W2', title: 'Waypoint 2 (Leipzig)', position: { lat: 51.3397, lng: 12.3731 } },
    { label: 'E', title: 'End (Munich)', position: { lat: 48.1351, lng: 11.582 } }
  ];
  private pointer!: google.maps.marker.AdvancedMarkerElement;
  private animationFrameId: number | null = null;
  private path: google.maps.LatLngLiteral[] = [];
  private currentIndex = 0;
  duration: number = 30;
  isRunning = false;
  isPaused = false;


  ngAfterViewInit(): void {
    const mapOptions: google.maps.MapOptions = {
      center: this.points[0].position,
      zoom: 6,
      mapId: 'DEMO_MAP_ID'
    };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    this.renderMarkers();
    this.drawRoute();
  }

  private renderMarkers(): void {
    this.points.forEach((point, index) => {
      let color = 'blue';
      if (index === 0)
        color = 'darkgreen';
      else if (index === this.points.length - 1)
        color = 'red';

      new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: point.position,
        title: point.title,
        content: this.createColoredMarker(color)
      });
    });
  }

  private drawRoute(): void {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });

    const start = this.points[0].position;
    const waypoints =
      this.points.slice(1, this.points.length - 1)
        .map(p => ({ location: p.position, stopover: true }));
    const end = this.points[this.points.length - 1].position;

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
        } else
          console.error('Directions request failed due to ' + status);
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

    // Add pointer marker
    this.pointer = new google.maps.marker.AdvancedMarkerElement({
      position: this.path[0],
      map: this.map,
      title: 'Moving pointer',
      content: this.createPointerElement()
    });
  }

  private animate(): void {
    const totalSteps = this.path.length;
    const totalFrames = this.duration * 165; // assuming 60 FPS
    const pointsPerFrame = totalSteps / totalFrames;

    let progress = this.currentIndex;

    const step = () => {
      if (!this.isRunning || this.isPaused) return;

      this.pointer.position = this.path[Math.floor(progress)];

      progress += pointsPerFrame;
      this.currentIndex = Math.floor(progress);

      if (this.currentIndex >= totalSteps) {
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
  }

  pause(): void {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.animate();
  }

  end(): void {
    console.log('Simulation ended.');
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
