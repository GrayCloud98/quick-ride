import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {Location} from '../../models/location.model'
import {Ride, VehicleClass} from '../../models/ride.model';

import {RideRequestService} from '../../services/ride-request.service';
import {AuthService} from '../../../auth/auth.service';

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
    pickup: {latitude: 0, longitude: 0},
    dropoff: {latitude: 0, longitude: 0},
    vehicleClass: VehicleClass.SMALL,
    active: false
  };

  constructor(
    private rideService: RideRequestService,
    private authService: AuthService,
    private router: Router,
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
        break;

      case updateType.dropoff:
        this.dropoffPicked = true;
        this.ride.dropoff = location;
        this.dropoffControl.setValue(location);
        break;
    }
  }

  submit() {
    const rideDataJson: any = {
      vehicleClass: `${this.ride.vehicleClass}`,
      startLatitude: `${this.ride.pickup.latitude}`,
      startLongitude: `${this.ride.pickup.longitude}`,
      destinationLatitude: `${this.ride.dropoff.latitude}`,
      destinationLongitude: `${this.ride.dropoff.longitude}`,
      startLocationName: `${this.ride.pickup.name}`,
      destinationLocationName: `${this.ride.dropoff.name}`,
      startAddress: `${this.ride.pickup.address}`,
      destinationAddress: `${this.ride.dropoff.address}`
    };

    this.rideService.submitRide(rideDataJson).subscribe({
      next: () => {
        this.rideService.updateActiveRideStatus();
        this.router.navigate(['/ride/active']);
      },
      error: error => {
        console.error('Error:', error);
      }
    });
  }
}
