import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RideRatingDialogComponent } from '../ride-rating-dialog/ride-rating-dialog.component';
import { RideStateService } from '../../ride/services/ride-state.service';
import { ActivatedRoute } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { RideSocketService } from '../../ride/services/ride-socket.service';
import {SimulationService, Simulation, SimulationStatus} from '../simulation.service';

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

rideCompleted = false;
rideId!: string;
role: 'driver' | 'customer' = 'driver';

private pollingIntervalId: any;

private map!: google.maps.Map;
private directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
private directionsResult: google.maps.DirectionsResult | null = null;
public simulationStarted = false;
simulation!: Simulation;


constructor(private dialog: MatDialog, private rideStateService: RideStateService, private activatedRoute: ActivatedRoute, private rideSocketService: RideSocketService,
            private simulationService: SimulationService) { }

ngOnInit(): void {
  this.activatedRoute.queryParams.subscribe(params => {
    const roleParam = params['role'];
    if (roleParam === 'driver' || roleParam === 'customer') {
      this.role = roleParam;
    } else {
      console.warn('No valid role provided in URL. Defaulting to "driver".');
      this.role = 'driver';
    }

    console.log('🌐 Role is:', this.role);

    // Proceed only after role is set
    this.simulationService.getAcceptedRideDetails().subscribe({
      next: data => {
        this.simulation = data;
        this.rideId = data.rideId.toString();
        this.pickupLocation = { lat: data.startLat, lng: data.startLng };
        this.dropoffLocation = { lat: data.destLat, lng: data.destLng };
        this.center = this.pickupLocation;

        this.tryStartSimulation();

        // Start polling for both roles
        this.pollingIntervalId = setInterval(() => {
          this.simulationService.getUpdateSimulation(Number(this.rideId)).subscribe({
            next: update => {
              console.log('[POLL]', this.role, '| Status:', update.status, '| Speed:', update.simulationSpeed);

              this.simulation.currentLat = update.currentLat;
              this.simulation.currentLng = update.currentLng;
              this.simulation.status = update.status;
              this.simulation.simulationSpeed = update.simulationSpeed;

              this.markerPosition = {
                lat: update.currentLat,
                lng: update.currentLng
              };

              if (update.status === SimulationStatus.COMPLETED) {
                this.stopSimulation(false);
              }

              if (update.status === SimulationStatus.PAUSED && this.isRunning) {
                this.pauseSimulation();
              }

              if (update.status === SimulationStatus.IN_PROGRESS && !this.isRunning && !this.rideCompleted) {
                this.resumeSimulation();
              }

              if (this.speed !== update.simulationSpeed) {
                this.speed = update.simulationSpeed;
                if (this.isRunning) {
                  clearInterval(this.intervalId);
                  this.startInterval();
                }
              }
            },
            error: err => console.error('[POLL ERROR]', err)
          });
        }, 5);
      },
      error: err => console.error("getAcceptedRideDetails failed", err)
    });
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
  if (this.isRunning || !this.pickupLocation || !this.dropoffLocation || this.rideCompleted) return;

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

    this.directionsResult = result;
    this.directionsRenderer.setDirections(result);

    this.startInterval();
  }).catch(error => {
    this.isRunning = false;
    console.error('Directions request failed:', error);
  });
}

private startInterval(): void {
  if (this.routePath.length < 2 || this.progress >= this.routePath.length - 1) return;

  const intervalTime = (this.speed * 1000) / (this.routePath.length - 1);
  this.eta = Math.round((this.routePath.length - 1 - this.progress) * intervalTime / 1000);
  this.isRunning = true;

  this.intervalId = setInterval(() => {
    this.progress++;
    this.markerPosition = this.routePath[this.progress];
    this.eta = Math.round((this.routePath.length - 1 - this.progress) * intervalTime / 1000);


  this.simulation.currentLat = this.markerPosition.lat;
  this.simulation.currentLng = this.markerPosition.lng;
  this.simulation.status = SimulationStatus.IN_PROGRESS;
  this.simulation.simulationSpeed = this.speed;

  this.simulationService.postUpdateSimulation(this.simulation).subscribe();



    if (this.progress >= this.routePath.length - 1) {
      this.stopSimulation(true); // Show rating at natural end
    }
  }, intervalTime);
}

  pauseSimulation(): void {
  if (this.isRunning) {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.simulation.status = SimulationStatus.PAUSED;

    this.simulationService.postUpdateSimulation(this.simulation).subscribe();
  }
}


resumeSimulation(): void {
  if (!this.isRunning && this.simulationStarted && this.progress < this.routePath.length - 1) {
    this.simulation.status = SimulationStatus.IN_PROGRESS;

    this.simulationService.postUpdateSimulation(this.simulation).subscribe(() => {
      this.startInterval();
    });
  }
}


  stopSimulation(showRating = true): void {
  clearInterval(this.intervalId);
  this.isRunning = false;
  this.simulationStarted = false;
  this.progress = 0;
  this.eta = 0;
  this.rideCompleted = true;

  this.simulation.status = SimulationStatus.COMPLETED;
  this.simulationService.postUpdateSimulation(this.simulation).subscribe();

  if (showRating && this.role === 'driver') {
    this.dialog.open(RideRatingDialogComponent).afterClosed().subscribe(result => {
      if (result) {
        this.simulationService.submitRideRating(Number(this.rideId), result.rating, result.feedback).subscribe();
      }
    });
  }
}

  onSpeedChange(value: number): void {
  this.speed = Number(value);
  this.simulation.simulationSpeed = this.speed;

  if (this.isRunning) {
    clearInterval(this.intervalId);
    this.startInterval();
  }

  this.simulationService.postUpdateSimulation(this.simulation).subscribe();
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

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
  }
}
