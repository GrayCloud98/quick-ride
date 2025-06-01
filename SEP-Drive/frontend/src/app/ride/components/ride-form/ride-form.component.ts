import {Component, OnInit} from '@angular/core';

import {Location} from '../../models/location.model'
import {Ride, VehicleClass} from '../../models/ride.model';

import {GeolocationService} from '../../services/geolocation.service';
import {PlacesService} from '../../services/places.service';

import {FormControl, Validators} from '@angular/forms';
import {catchError, debounceTime, distinctUntilChanged, Observable, of, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {RideRequestService} from '../../services/ride-request.service';

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
  vehicles = Object.values(VehicleClass);
  ride: Ride = {
    pickup: {latitude: 0, longitude: 0},
    dropoff: {latitude: 0, longitude: 0},
    vehicleClass: VehicleClass.SMALL,
    active: false
  };

  pickupPicked: boolean = false;
  dropoffPicked: boolean = false;

  pickupControl = new FormControl<Location | string>('', [Validators.required]);
  dropoffControl = new FormControl<Location | string>('', [Validators.required]);

  filteredPickupOptions!: Observable<Location[]>;
  filteredDropoffOptions!: Observable<Location[]>;

  protected readonly updateType = updateType;

  constructor(
    private geolocationService: GeolocationService,
    private placesService: PlacesService,
    private rideService: RideRequestService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    //const user = JSON.parse(<string>localStorage.getItem('currentUser'));
    //const username = user?.username;

    this.rideService.userHasActiveRide().subscribe({
      next: response => this.ride.active = response,
      error: err => console.log(err)
    })

    this.filteredPickupOptions = this.setupAutocomplete(this.pickupControl);
    this.filteredDropoffOptions = this.setupAutocomplete(this.dropoffControl);
  }

  onSearch(query: string) {
    if (!query.trim()) return of([]);
    return this.placesService.searchPlaces(query);
  }

  private setupAutocomplete(control: FormControl) {
    return control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => typeof value === 'string' ? value : value?.name || ''),
      switchMap(query => this.onSearch(query).pipe(
        catchError(() => of([])),
      ))
    );
  }

  onLocationSelected(location: Location, type: updateType) {
    switch (type) {
      case updateType.pickup:
        this.pickupPicked = true;
        this.ride.pickup = location;
        break;
      case updateType.dropoff:
        this.dropoffPicked = true;
        this.ride.dropoff = location;
        break;
    }
  }

  myLocation() {
    this.geolocationService.getLocation().subscribe({
      next: (myLocation: Location) => {
        this.pickupPicked = true;
        this.ride.pickup = myLocation;
        this.ride.pickup.name = "My Location";
        this.pickupControl.setValue(myLocation);
      }
    })
  }

  get isFormInvalid(): boolean {
    return (
      this.ride.active ||
      !this.pickupPicked ||
      !this.dropoffPicked
    );
  }

  submit() {

    //const user = JSON.parse(<string>localStorage.getItem('currentUser'));
    //const username = user?.username;

    const rideDataJson: any = {
      vehicleClass: this.ride.vehicleClass,
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
