import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {Location} from '../../models/location.model'
import {Ride, VehicleClass} from '../../models/ride.model';

import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';
import { DistanceService } from '../../services/distance.service';
import {RideStateService} from '../../services/ride-state.service';

enum updateType {
pickup,
dropoff,
}

@Component({
selector: 'ride-form',
standalone: false,
templateUrl: './ride-form.component.html',
styleUrl: './ride-form.component.scss',
})
export class RideFormComponent implements OnInit {

username!: string
vehicles = Object.values(VehicleClass);

pickupPicked: boolean = false;
dropoffPicked: boolean = false;

protected readonly updateType = updateType;

pickupControl = new FormControl<Location | string>('', [Validators.required]);
dropoffControl = new FormControl<Location | string>('', [Validators.required]);

ride: Ride = {
pickup: { latitude: 0, longitude: 0 },
dropoff: { latitude: 0, longitude: 0 },
vehicleClass: VehicleClass.SMALL,
active: false,
distance: 0,
duration: 0,
estimatedPrice: 0
};

submitFailed = false;

constructor(
    private rideService: RideRequestService,
    private authService: AuthService,
    private router: Router,
    private distanceService: DistanceService,
    private rideStateService: RideStateService
  ) {
  }

  get isFormInvalid(): boolean {
    return (
      this.ride.active ||
      !this.pickupPicked ||
      !this.dropoffPicked
    );
  }

  ngOnInit() {
    this.authService.currentUser.subscribe({
      next: user => {
        if (user?.username)
          this.username = user.username;
      },
      error: err => console.log(err)
    })

    this.rideService.activeRideStatus$.subscribe({
      next: response => this.ride.active = response,
      error: err => console.log(err)
    })
  }

  onLocationSelected(location: Location, type: updateType) {
    switch (type) {
      case updateType.pickup:
        this.pickupPicked = true;
        this.ride.pickup = location;
        this.pickupControl.setValue(location);
        this.rideStateService.setPickupLocation({
          lat: location.latitude,
          lng: location.longitude
        })
        break;

      case updateType.dropoff:
        this.dropoffPicked = true;
        this.ride.dropoff = location;
        this.dropoffControl.setValue(location);
        this.rideStateService.setDropoffLocation({
          lat: location.latitude,
          lng: location.longitude
        })
        break;
    }
    this.updateDistanceInfo();
  }

  submit() {
  this.rideService.submitRide(this.ride).subscribe({
    next: () => {
      this.rideService.updateActiveRideStatus();
      void this.router.navigate(['/ride/active']);
    },
    error: () => this.submitFailed = true
  });
}

  updateDistanceInfo() {
    if (this.pickupPicked && this.dropoffPicked) {
      const origin = { lat: this.ride.pickup.latitude, lng: this.ride.pickup.longitude };
      const destination = { lat: this.ride.dropoff.latitude, lng: this.ride.dropoff.longitude };

      this.distanceService.getDistanceDurationAndPrice(origin, destination, this.ride.vehicleClass)
        .then(res => {
          this.ride.distance = res.distance;
          this.ride.duration = res.duration;
          this.ride.estimatedPrice = res.estimatedPrice;
        })
        .catch(err => console.error('Google Distance API error', err));
    }
  }
}
