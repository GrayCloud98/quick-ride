import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { RideStateService } from '../ride/services/ride-state.service';
import { GeolocationService } from '../ride/services/geolocation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})

export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  map!: google.maps.Map;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;

  pickupLocation: { lat: number, lng: number } | null = null;
  dropoffLocation: { lat: number, lng: number } | null = null;

  pickupSub!: Subscription;
  dropoffSub!: Subscription;
  pickupMarker!: google.maps.Marker;
  dropoffMarker!: google.maps.Marker;
  userLocationMarker!: google.maps.Marker;

  constructor(
    private rideStateService: RideStateService,
    private geolocationService: GeolocationService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.pickupSub = this.rideStateService.pickupLocation$.subscribe(location => {
      this.pickupLocation = location;
      this.tryDrawRoute();
    });
    this.dropoffSub = this.rideStateService.dropoffLocation$.subscribe(location => {
      this.dropoffLocation = location;
      this.tryDrawRoute();
    });
  }

  ngOnDestroy(): void {
    this.pickupSub?.unsubscribe();
    this.dropoffSub?.unsubscribe();
  }

  initMap(): void {
    const defaultCenter = { lat: 51.1657, lng: 10.4515 };
    const defaultZoom = 7;

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: defaultZoom,
      styles: snazzyMapStyle,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeOpacity: 0.95,
        strokeWeight: 7,
        clickable: false
      }
    });

    this.geolocationService.getLocation().subscribe({
      next: (location) => {
        const userLocation = {
          lat: location.latitude,
          lng: location.longitude
        };
        this.map.setCenter(userLocation);
        this.map.setZoom(14);
      },
      error: (err) => {
        console.warn('Geolocation service failed, using default center:', err);
      }
    });

    this.geolocationService.getLocation().subscribe({
      next: (location) => {
        const userLocation = {
          lat: location.latitude,
          lng: location.longitude
        };
        this.map.setCenter(userLocation);
        this.map.setZoom(12);

        this.userLocationMarker?.setMap(null);
        this.userLocationMarker = new google.maps.Marker({
          position: userLocation,
          map: this.map,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;utf8,<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="34" rx="13" ry="8" fill="deepskyblue" stroke="white" stroke-width="2"/><circle cx="24" cy="17" r="8" fill="%23ffe0b2" stroke="white" stroke-width="2"/><ellipse cx="21" cy="16.5" rx="1.4" ry="2" fill="%23222"/><ellipse cx="27" cy="16.5" rx="1.4" ry="2" fill="%23222"/><path d="M21 20c1 1.5 5 1.5 6 0" stroke="%23222" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>',
            scaledSize: new google.maps.Size(48, 48)
          }
        });
      },
      error: (err) => {
        console.warn('Geolocation service failed, using default center:', err);
      }
    });
  }

  tryDrawRoute(): void {
    if (this.pickupLocation && this.dropoffLocation) {
      this.drawRoute();
    } else {
      this.directionsRenderer.setDirections(null);
    }
  }

  drawRoute(): void {
    if (!this.map || !this.pickupLocation || !this.dropoffLocation) return;

    // Clear route and previous markers
    this.directionsRenderer.setDirections(null);
    this.pickupMarker?.setMap(null);
    this.dropoffMarker?.setMap(null);

    this.directionsService.route({
      origin: this.pickupLocation,
      destination: this.dropoffLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    })
      .then(result => {
        this.directionsRenderer.setDirections(result);

        // Add custom markers
        this.pickupMarker = new google.maps.Marker({
          position: this.pickupLocation,
          map: this.map,
          title: 'Pickup',
          icon: {
            url: 'data:image/svg+xml;utf-8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="limegreen" stroke="white" stroke-width="3"/><polygon points="16,13 28,20 16,27" fill="white"/></svg>',
            scaledSize: new google.maps.Size(40, 40)
          }
        });
        this.dropoffMarker = new google.maps.Marker({
          position: this.dropoffLocation,
          map: this.map,
          title: 'Dropoff',
          icon: {
            url: 'data:image/svg+xml;utf-8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="tomato" stroke="white" stroke-width="3"/><path d="M14 27 L14 13 L28 16 L28 24 Z" fill="white" stroke="white" stroke-width="1"/></svg>',
            scaledSize: new google.maps.Size(40, 40)
          }
        });
      })
      .catch(err => {
        console.error('Directions request failed', err);
      });
  }
}

const snazzyMapStyle = [
  {
    "featureType": "all",
    "elementType": "all",
    "stylers": [
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#000000" },
      { "lightness": 20 }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#000000" },
      { "lightness": 17 },
      { "weight": 1.2 }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      { "color": "#000000" },
      { "lightness": 20 }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#4d6059" }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#4d6059" }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#4d6059" }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      { "lightness": 21 }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#4d6059" }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#4d6059" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#7f8d89" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#7f8d89" }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#7f8d89" },
      { "lightness": 17 }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#7f8d89" },
      { "lightness": 29 },
      { "weight": 0.2 }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      { "color": "#000000" },
      { "lightness": 18 }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#7f8d89" }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#7f8d89" }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      { "color": "#000000" },
      { "lightness": 16 }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#7f8d89" }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#7f8d89" }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "color": "#000000" },
      { "lightness": 19 }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      { "color": "#2b3638" },
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      { "color": "#2b3638" },
      { "lightness": 17 }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#24282b" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#24282b" }
    ]
  }
];
