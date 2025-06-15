import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RideRatingDialogComponent } from '../ride-rating-dialog/ride-rating-dialog.component';
import { RideStateService } from '../ride/services/ride-state.service';
import { ActivatedRoute } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { RideSocketService } from '../ride/services/ride-socket.service';
import {RideRequestService} from '../ride/services/ride-request.service';
import { Ride } from '../ride/models/ride.model';

@Component({
selector: 'app-ride-simulation',
standalone: false,
templateUrl: './ride-simulation.component.html',
styleUrls: ['./ride-simulation.component.scss']
})
export class RideSimulationComponent implements OnInit, AfterViewInit {
@ViewChild(GoogleMap, { static: false }) mapComponent!: GoogleMap;

center: google.maps.LatLngLiteral = { lat: 51.1657, lng: 10.4515 };
zoom = 7;

routePath: google.maps.LatLngLiteral[] = [];
markerPosition!: google.maps.LatLngLiteral;
isRunning = false;
speed = 15;
progress = 0;
intervalId: any;
eta = 0;

pickupLocation: google.maps.LatLngLiteral | null = null;
dropoffLocation: google.maps.LatLngLiteral | null = null;


rideId!: string;
role: 'driver' | 'customer' = 'driver';
private map!: google.maps.Map;
private directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
private directionsResult: google.maps.DirectionsResult | null = null;
private simulationStarted = false;


constructor(private dialog: MatDialog, private rideStateService: RideStateService, private activatedRoute: ActivatedRoute, private rideSocketService: RideSocketService,
            private rideService: RideRequestService) { }


ngOnInit(): void {
    this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });

    this.activatedRoute.queryParams.subscribe(params => {
      this.role = params['role'] === 'customer' ? 'customer' : 'driver';
      this.rideId = params['rideId'];

      this.loadRideDetails();
    });
  }

  ngAfterViewInit(): void {
    const waitForMap = setInterval(() => {
      if (this.mapComponent?.googleMap) {
        this.map = this.mapComponent.googleMap;
        this.directionsRenderer.setMap(this.map);
        console.log('✅ Map initialized');
        if (this.directionsResult) {
          this.directionsRenderer.setDirections(this.directionsResult);
        }
        clearInterval(waitForMap);
      }
    }, 200);
  }

private loadRideDetails(): void {
    const rideObservable = this.rideService.getAcceptedRideDetails(); // JWT handles user identity
    rideObservable.subscribe({
      next: (ride: Ride) => {
        console.log('📦 Ride details received:', ride);
        this.pickupLocation = {
          lat: ride.pickup.startLat,
          lng: ride.pickup.startLng
        };
        this.dropoffLocation = {
          lat: ride.dropoff.destLat,
          lng: ride.dropoff.startLng
        };
        this.center = this.pickupLocation;
        this.tryStartSimulation();

        if (this.role === 'customer') {
          this.rideSocketService.subscribeToRide(this.rideId);
          this.rideSocketService.position$.subscribe(position => {
            if (position) this.markerPosition = position;
          });
        }
      },
      error: err => {
        console.error('❌ Failed to load ride data:', err);
      }
    });
  }
private tryStartSimulation(): void {
    if (this.simulationStarted || !this.pickupLocation || !this.dropoffLocation || !this.map) {
      console.warn('⏳ Simulation cannot start yet');
      return;
    }

    this.simulationStarted = true;
    this.center = this.pickupLocation;

    if (this.role === 'driver') {
      this.startSimulation();
    } else {
      this.drawRouteOnly();
    }
  }

  private drawRouteOnly(): void {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
      origin: this.pickupLocation!,
      destination: this.dropoffLocation!,
      travelMode: google.maps.TravelMode.DRIVING
    }).then(result => {
      console.log('✅ Customer directions loaded');
      this.directionsResult = result;
      this.routePath = result.routes[0].overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));
      this.markerPosition = this.routePath[0];
      this.directionsRenderer.setDirections(result);
    }).catch(error => {
      console.error('❌ Route draw failed:', error);
    });
  }

  startSimulation(): void {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
      origin: this.pickupLocation!,
      destination: this.dropoffLocation!,
      travelMode: google.maps.TravelMode.DRIVING
    }).then(result => {
      console.log('✅ Driver directions loaded');
      this.directionsResult = result;
      this.routePath = result.routes[0].overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));
      this.markerPosition = this.routePath[0];
      this.directionsRenderer.setDirections(result);
      this.startInterval();
    }).catch(error => {
      console.error('❌ Simulation route failed:', error);
    });
  }

  private startInterval(): void {
    const intervalTime = (this.speed * 1000) / (this.routePath.length - 1);
    this.eta = Math.round((this.routePath.length - 1) * intervalTime / 1000);
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      if (this.progress < this.routePath.length - 1) {
        this.progress++;
        this.markerPosition = this.routePath[this.progress];

        if (this.role === 'driver') {
          this.rideSocketService.sendPositionUpdate(this.rideId, this.markerPosition);
        }

        const remaining = this.routePath.length - 1 - this.progress;
        this.eta = Math.round(remaining * intervalTime / 1000);
      } else {
        this.stopSimulation();
      }
    }, intervalTime);
  }

  pauseSimulation(): void {
    this.isRunning = false;
    clearInterval(this.intervalId);
  }

  stopSimulation(): void {
    this.pauseSimulation();
    this.simulationStarted = false;
    this.progress = 0;
    this.isRunning = false;
    this.eta = 0;
    this.markerPosition = this.routePath[0];

    this.dialog.open(RideRatingDialogComponent).afterClosed().subscribe(result => {
      if (result) {
        console.log('⭐ Ride rated:', result.rating, result.feedback);
        // Optionally: send to backend
      }
    });
  }

  onSpeedChange(value: number): void {
    this.speed = value;
    if (this.isRunning) {
      this.pauseSimulation();
      this.startInterval();
    }
  }

  handleSpeedInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onSpeedChange(Number(input.value));
  }

  get formattedEta(): string {
    const minutes = Math.floor(this.eta / 60);
    const seconds = this.eta % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
