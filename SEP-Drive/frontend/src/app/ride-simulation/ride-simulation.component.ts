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

    const rideObservable = this.role === 'driver'
      ? this.rideService.getAcceptedRideDetails()
      : this.rideService.getRide();

    rideObservable.subscribe({
      next: data => {
        this.handleRideData(data);

        if (this.role === 'customer') {
          this.rideSocketService.subscribeToRide(this.rideId);
          this.rideSocketService.position$.subscribe(position => {
            if (position) this.markerPosition = position;
          });
        }
      },
      error: err => console.error('Failed to load ride data:', err)
    });
  });

  // Live updates from RideStateService (optional)
  this.rideStateService.pickupLocation$.subscribe(pickup => {
    this.pickupLocation = pickup;
    this.tryStartSimulation();
  });

  this.rideStateService.dropoffLocation$.subscribe(dropoff => {
    this.dropoffLocation = dropoff;
    this.tryStartSimulation();
  });
}




ngAfterViewInit(): void {
  setTimeout(() => {
    if (this.mapComponent?.googleMap) {
      this.map = this.mapComponent.googleMap;
      this.directionsRenderer.setMap(this.map);
      console.log('✅ Map is ready:', this.map);

      if (this.directionsResult) {
        this.directionsRenderer.setDirections(this.directionsResult);
      }
    }
  });
}


private tryStartSimulation(): void {
    if (this.simulationStarted || !this.pickupLocation || !this.dropoffLocation) return;
    this.simulationStarted = true;
    this.center = this.pickupLocation;
    if (this.role === 'driver') {
      this.startSimulation();
    }
  }



startSimulation(): void {
    if (this.isRunning || !this.pickupLocation || !this.dropoffLocation) return;

    this.isRunning = true;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route({
      origin: this.pickupLocation,
      destination: this.dropoffLocation,
      travelMode: google.maps.TravelMode.DRIVING
    }).then(result => {
      const path = result.routes[0].overview_path;
      this.routePath = path.map(p => ({ lat: p.lat(), lng: p.lng() }));
      this.markerPosition = this.routePath[0];
      this.progress = 0;

      this.directionsResult = result; // ✅ Store result
      this.directionsRenderer.setDirections(result); // ✅ apply to map if ready


      this.startInterval();
    }).catch(error => {
      this.isRunning = false;
      console.error('Directions request failed:', error);
    });
  }

private startInterval(): void {
    if (this.routePath.length < 2) return;

    const intervalTime = (this.speed * 1000) / (this.routePath.length - 1);
    this.eta = Math.round((this.routePath.length - 1) * intervalTime / 1000);
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      if (this.progress < this.routePath.length - 1) {
        this.progress++;
        this.markerPosition = this.routePath[this.progress];
        const remaining = this.routePath.length - 1 - this.progress;
        this.eta = Math.round(remaining * intervalTime / 1000);
         if (this.role === 'driver') {
          this.rideSocketService.sendPositionUpdate(this.rideId, this.markerPosition);
        }
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
    this.progress = 0;
    this.markerPosition = this.routePath.length > 0 ? this.routePath[0] : { lat: 0, lng: 0 };
    this.eta = 0;
    this.simulationStarted = false;   // ✅ allow restart again
    this.isRunning = false;

    this.dialog.open(RideRatingDialogComponent).afterClosed().subscribe(result => {
      if (result) {
        console.log('User rated the ride:', result.rating);
        console.log('Feedback:', result.feedback);
        // TODO: send to backend or confirmation logic
      }
    });
  }

  onSpeedChange(value: number): void {
    this.speed = Number(value);
    if (this.isRunning && this.routePath.length > 1 ) {
      this.pauseSimulation();
      this.startSimulation(); // Restart at new speed
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

  private handleRideData(ride: Ride): void {
  this.pickupLocation = {
    lat: ride.pickup.latitude,
    lng: ride.pickup.longitude
  };
  this.dropoffLocation = {
    lat: ride.dropoff.latitude,
    lng: ride.dropoff.longitude
  };
  this.tryStartSimulation();
}

}
