import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {filter, switchMap, tap} from 'rxjs';

import {Ride} from '../../models/ride.model';
import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';
import {RideStateService} from '../../services/ride-state.service';
import {SimulationService} from '../../../simulation/simulation.service';

@Component({
  selector: 'app-active-ride-page',
  standalone: false,
  templateUrl: './active-ride-page.component.html',
  styleUrl: './active-ride-page.component.scss'
})
export class ActiveRidePageComponent implements OnInit {
  username: string = '';
  accessAllowed: boolean = false;
  userHasActiveRide: boolean = false;
  userHasActiveSimulation: boolean = false;
  activeRide!: Ride;

  constructor(
    private rideService: RideRequestService,
    private authService: AuthService,
    private rideStateService: RideStateService,
    private simService: SimulationService,
    private router: Router
  ) {}
  deactivateRide() {
    this.rideService.deactivateRide().subscribe({
      next: () => {
        this.rideService.updateActiveRideStatus();
        this.rideStateService.resetLocations();
        void this.router.navigate(['/ride/request']);
      },
      error: (err) => console.log(err)
    })
  }

  ngOnInit() {
    if (this.authService.currentUserValue) {
      this.accessAllowed = this.authService.currentUserValue.role === 'Customer';
      this.simService.activeSimulationStatus$.subscribe({
        next: userHasActiveSimulation => this.userHasActiveSimulation = userHasActiveSimulation
      })
      if (!this.accessAllowed || this.userHasActiveSimulation) return;


      this.rideService.activeRideStatus$.pipe(
        tap(userHasActiveRide => this.userHasActiveRide = userHasActiveRide),
        filter(userHasActiveRide => userHasActiveRide),
        switchMap(() => this.rideService.getRide())
      ).subscribe({
        next: ride => {
          this.activeRide = ride;
          this.rideStateService.setPickupLocation({
            lat: ride.pickup.latitude,
            lng: ride.pickup.longitude
          });
          this.rideStateService.setDropoffLocation({
            lat: ride.dropoff.latitude,
            lng: ride.dropoff.longitude
          });
          this.rideStateService.setStopovers(
            ride.stopovers!.map((stop: { latitude: number; longitude: number }) => ({
              lat: stop.latitude,
              lng: stop.longitude
            }))
          );
        },
        error: err => console.log(err)
      });
    }
  }
}
