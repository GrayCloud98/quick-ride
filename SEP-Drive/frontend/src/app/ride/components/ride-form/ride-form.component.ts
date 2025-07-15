import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {Location} from '../../models/location.model'
import {Ride, VehicleClass} from '../../models/ride.model';

import {RideRequestService} from '../../services/ride-request.service';
import {DistanceService} from '../../services/distance.service';
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
  vehicles = Object.values(VehicleClass);

  pickupPicked: boolean = false;
  dropoffPicked: boolean = false;

  protected readonly updateType = updateType;

  pickupControl = new FormControl<Location | string>('', [Validators.required]);
  dropoffControl = new FormControl<Location | string>('', [Validators.required]);

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

  constructor(
    private rideService: RideRequestService,
    private router: Router,
    private distanceService: DistanceService,
    private rideStateService: RideStateService
  ) {}

  get isFormInvalid(): boolean {
    return (
      this.ride.active ||
      !this.pickupPicked ||
      !this.dropoffPicked
    );
  }

  ngOnInit() {
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
        });
        break;

      case updateType.dropoff:
        this.dropoffPicked = true;
        this.ride.dropoff = location;
        this.dropoffControl.setValue(location);
        this.rideStateService.setDropoffLocation({
          lat: location.latitude,
          lng: location.longitude
        });
        break;

      // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
      default:
        if (!this.ride.stopovers) {
          this.ride.stopovers = [];
        }
        this.ride.stopovers![type] = location;
        this.stopoversControl.at(type).setValue(location);
        this.syncStopoversToState();
      // ENDE DER FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
    }

    void this.updateDistanceInfo();
  }

  submit() {
    this.rideService.submitRide(this.ride).subscribe({
      next: () => {
        this.rideService.updateActiveRideStatus();
        void this.router.navigate(['/ride/active']);
      },
    });
  }

  async updateDistanceInfo() {
    if (this.pickupPicked && this.dropoffPicked) {
      const points = [this.ride.pickup, ...this.ride.stopovers!, this.ride.dropoff ];

      let totalDistance = 0;
      let totalDuration = 0;
      let totalEstimatedPrice = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const origin = { lat: points[i].latitude, lng: points[i].longitude };
        const destination = { lat: points[i + 1].latitude, lng: points[i + 1].longitude };

        try {
          const res = await this.distanceService.getDistanceDurationAndPrice(origin, destination, this.ride.vehicleClass);
          totalDistance += res.distance;
          totalDuration += res.duration;
          totalEstimatedPrice += res.estimatedPrice;
        } catch (err) {
          console.error(`Distance API error between point ${i} and ${i + 1}`, err);
        }
      }

      this.ride.distance = totalDistance;
      this.ride.duration = totalDuration;
      this.ride.estimatedPrice = totalEstimatedPrice;
    }
  }

  // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
  stopoversControl = new FormArray<FormControl<Location | string>>([]);

  addStopover() {
    const control = new FormControl<Location | string>('', {
      validators: [Validators.required],
      nonNullable: true
    });
    this.stopoversControl.push(control);
  }

  removeStopover(index: number) {
    this.stopoversControl.removeAt(index);

    if (this.ride.stopovers) {
      this.ride.stopovers.splice(index, 1);
      this.syncStopoversToState();
    }

    void this.updateDistanceInfo();
  }

  private syncStopoversToState() {
    this.rideStateService.setStopovers(
      this.ride.stopovers!.map(stop => ({
        lat: stop.latitude,
        lng: stop.longitude
      }))
    );
  }
  // ENDE DER FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
}
