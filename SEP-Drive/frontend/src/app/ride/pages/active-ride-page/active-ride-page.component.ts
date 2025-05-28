import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {filter, switchMap, tap} from 'rxjs';

import {Ride} from '../../models/ride.model';

import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-active-ride-page',
  standalone: false,
  templateUrl: './active-ride-page.component.html',
  styleUrl: './active-ride-page.component.scss'

})
export class ActiveRidePageComponent implements OnInit {

  username: string = '';
  accessAllowed: boolean = false;
  userHasActiveRide: boolean = true;
  activeRide!: Ride;
  constructor(
    private rideService: RideRequestService,
    private authService: AuthService,
    private router: Router) {
  }

  deactivateRide() {
    this.rideService.deactivateRide(this.username).subscribe({
      next: () => {
        this.rideService.updateActiveRideStatus(this.username);
        void this.router.navigate(['/ride/request']);
      },
      error: (err) => console.log(err)
    })
  }

  ngOnInit() {
    this.authService.currentUser.pipe(
      filter(user => !!user?.username),
      tap(user => this.username = user!.username!),
      switchMap(() => this.authService.isCustomer(this.username)),
      tap(isCustomer => this.accessAllowed = isCustomer),
      filter(isCustomer => isCustomer),
      switchMap(() => this.rideService.activeRideStatus$),
      tap(hasActive => this.userHasActiveRide = hasActive),
      filter(hasActive => hasActive),
      switchMap(() => this.rideService.getRide(this.username)),
      tap(ride => this.activeRide = ride),
    ).subscribe({
      error: err => console.log(err)
    });
  }
}
