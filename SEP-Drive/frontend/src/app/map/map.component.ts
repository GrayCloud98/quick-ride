import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapElement', {static: true}) mapElement!: ElementRef;

  map!: google.maps.Map;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;

  pins = [
    { position: { lat: 51.4576, lng: 7.0225 }, title: 'Essen' },
    { position: { lat: 50.1109, lng: 8.6821 }, title: 'Frankfurt' },
    { position: { lat: 52.5200, lng: 13.4050 }, title: 'Berlin' },
  ];

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 39.8283, lng: -98.5795 }, // center of US
      zoom: 4,
    });

    // Add pins (markers)
    this.pins.forEach(pin => {
      new google.maps.Marker({
        position: pin.position,
        map: this.map,
        title: pin.title,
      });
    });

    // Initialize Directions Service and Renderer
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });

    // Draw route between pins
    this.drawRoute();
  }

  drawRoute(): void {
    if (this.pins.length < 2) {
      return;
    }

    const origin = this.pins[0].position;
    const destination = this.pins[this.pins.length - 1].position;
    const waypoints =
      this.pins.slice(1, -1)
      .map(pin => ({
        location: pin.position,
        stopover: true,
    }));

    this.directionsService
      .route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      })
      .then(result => {
        this.directionsRenderer.setDirections(result);
      })
      .catch(err => {
        console.error('Directions request failed', err);
      });
  }

  options: google.maps.MapOptions = {
    center: {lat: 40, lng: -20},
    zoom: 4
  };
}

