import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {Location} from '../../models/location.model'
import {Ride, VehicleClass} from '../../models/ride.model';

import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';
import { DistanceService } from '../../services/distance.service';
import {RideStateService} from '../../services/ride-state.service';

enum updateType {
  pickup = -2,
  dropoff = -1,
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
  stopoversControl = new FormArray<FormControl<Location | string>>([]);

  ride: Ride = {
    pickup: { latitude: 0, longitude: 0 },
    dropoff: { latitude: 0, longitude: 0 },
    stopovers: [],
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

      default:
        if (!this.ride.stopovers) {
          this.ride.stopovers = [];
        }
        this.ride.stopovers![type] = location;
        this.stopoversControl.at(type).setValue(location);
        this.rideStateService.setStopovers(
          this.ride.stopovers.map(stop => ({
            lat: stop.latitude,
            lng: stop.longitude
          }))
        )
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

  updateDistanceInfo(): void {
    if (!this.ride.pickup || !this.ride.dropoff) {
      console.warn('Pickup and dropoff must be selected.');
      return;
    }

    const points: google.maps.LatLngLiteral[] = [
      {
        lat: this.ride.pickup.latitude,
        lng: this.ride.pickup.longitude,
      },
      ...this.ride.stopovers?.map(stop => ({
        lat: stop.latitude,
        lng: stop.longitude,
      })) || [],
      {
        lat: this.ride.dropoff.latitude,
        lng: this.ride.dropoff.longitude,
      }
    ];

    this.distanceService.getDistanceDurationAndPriceForMultiplePoints(points, this.ride.vehicleClass)
      .then(result => {
        this.ride.distance = result.distance;
        this.ride.duration = result.duration;
        this.ride.estimatedPrice = result.estimatedPrice;
      })
      .catch(error => {
        console.error('Failed to calculate distance/duration/price:', error);
      });
  }




  addStopover() {
    const control = new FormControl<Location | string>('', { validators: [Validators.required], nonNullable: true });
    this.stopoversControl.push(control);
  }

  removeStopover(index: number) {
    this.stopoversControl.removeAt(index);
    if (this.ride.stopovers) {
      this.ride.stopovers.splice(index, 1);

      this.rideStateService.setStopovers(
        this.ride.stopovers.map(stop => ({
          lat: stop.latitude,
          lng: stop.longitude
        }))
      );
    }
    this.updateDistanceInfo();
  }
}
