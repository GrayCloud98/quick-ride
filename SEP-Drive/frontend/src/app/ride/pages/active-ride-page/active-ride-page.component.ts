import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {filter, switchMap, tap} from 'rxjs';

import {Ride, VehicleClass} from '../../models/ride.model';
import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';
import {RideStateService} from '../../services/ride-state.service';

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
  activeRide: Ride = {
    pickup: { latitude: 0, longitude: 0 },
    dropoff: { latitude: 0, longitude: 0 },
    vehicleClass: VehicleClass.SMALL,
    active: false,
    distance: 0,
    duration: 0,
    estimatedPrice: 0
  };

  constructor(
    private rideService: RideRequestService,
    private authService: AuthService,
    private rideStateService: RideStateService,
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
    this.authService.currentUser.pipe(
      filter(user => !!user?.username),
      tap(user => this.username = user!.username!),
      switchMap(() => this.authService.isCustomer()),
      tap(isCustomer => this.accessAllowed = isCustomer),
      filter(isCustomer => isCustomer),
      switchMap(() => this.rideService.activeRideStatus$),
      tap(hasActive => this.userHasActiveRide = hasActive),
      filter(hasActive => hasActive),
      switchMap(() => this.rideService.getRide()),
      tap(ride => this.activeRide = ride),
    ).subscribe({
      error: err => console.log(err)
    });
  }
}
