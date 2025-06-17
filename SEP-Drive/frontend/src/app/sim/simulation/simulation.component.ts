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
    this.points.forEach(point => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: point.position,
        title: point.title,
        // content: this.createMarkerContent(point.label) // TODO APPLY CUSTOM MARKERS OR DELETE
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


  private createMarkerContent(label: string): HTMLElement { // TODO APPLY CUSTOM MARKERS OR DELETE
    const div = document.createElement('div');
    div.style.backgroundColor = '#4285F4';
    div.style.color = '#fff';
    div.style.borderRadius = '50%';
    div.style.padding = '8px';
    div.style.textAlign = 'center';
    div.style.fontSize = '14px';
    div.style.width = '32px';
    div.style.height = '32px';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.innerText = label;
    return div;
  }

  private createPointerElement(): HTMLElement {
    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = 'red';
    el.style.border = '2px solid white';
    return el;
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
