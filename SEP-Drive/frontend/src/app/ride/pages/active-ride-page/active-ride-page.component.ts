import {Component, OnInit} from '@angular/core';
import {Ride, VehicleClass} from '../../models/ride.model';
import {Location} from '../../models/location.model'
import {Router} from '@angular/router';
import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';
import {filter, switchMap, tap} from 'rxjs';

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
        this.router.navigate(['/ride/request']);
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  ngOnInit() {
    this.authService.currentUser.pipe(
      filter(user => !!user?.username),
      tap(user => this.username = user!.username!),
      switchMap(() => this.authService.isCustomer(this.username)),
      tap(isCustomer => this.accessAllowed = isCustomer),
      filter(isCustomer => isCustomer),
      switchMap(() => this.rideService.userHasActiveRide(this.username)),
      tap(hasActive => this.userHasActiveRide = hasActive),
      filter(hasActive => hasActive),
      switchMap(() => this.rideService.getRide(this.username)),
    ).subscribe({
      next: ride => this.activeRide = this.mapToRide(ride),
      error: err => console.log(err)
    })
  }

  private mapToRide(raw: any): Ride {

    const pickup: Location = {
      name: raw.startLocationName || undefined,
      latitude: Number(raw.startLatitude),
      longitude: Number(raw.startLongitude),
      address: raw.startAddress || undefined,
    };

    const dropoff: Location = {
      name: raw.destinationLocationName || undefined,
      latitude: Number(raw.destinationLatitude),
      longitude: Number(raw.destinationLongitude),
      address: raw.destinationAddress || undefined,
    };

    const ride: Ride = {
      pickup,
      dropoff,
      vehicleClass: raw.vehicleClass as VehicleClass,
      active: true
    };

    return ride;
  }
}
