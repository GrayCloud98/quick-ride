import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Ride} from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  private baseUrl = 'http://localhost:8080/api/ride-requests';

  constructor(private http: HttpClient) {
  }

  public submitRide(ride: Ride) {
    const rideJson: any = {
      vehicleClass: ride.vehicleClass,
      startLatitude: ride.pickup.latitude,
      startLongitude: ride.pickup.longitude,
      destinationLatitude: ride.dropoff.latitude,
      destinationLongitude: ride.dropoff.longitude,
      startLocationName: ride.pickup.name,
      destinationLocationName: ride.dropoff.name,
      startAddress: ride.pickup.address,
      destinationAddress: ride.dropoff.address,
      distance: ride.distance,
      duration: ride.duration,
      estimatedPrice: ride.estimatedPrice,

      // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
      waypoints: ride.stopovers?.map(
        (stopover, index) => ({
          address: stopover.address,
          name: stopover.name,
          latitude: stopover.latitude,
          longitude: stopover.longitude,
          sequenceOrder: index
        })
      ) ?? []
      // ENDE DER FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
    };
    return this.http.post<Ride>(this.baseUrl, rideJson);
  }

  public getRide(): Observable<Ride> {
    return this.http.get<Ride>(this.baseUrl).pipe(
      map((ride: any) => ({
        pickup: {
          latitude: ride.startLatitude,
          longitude: ride.startLongitude,
          address: ride.startAddress,
          name: ride.startLocationName
        },
        dropoff: {
          latitude: ride.destinationLatitude,
          longitude: ride.destinationLongitude,
          address: ride.destinationAddress,
          name: ride.destinationLocationName
        },
        vehicleClass: ride.vehicleClass,
        active: true,
        distance: ride.distance || 0,
        duration: ride.duration || 0,
        estimatedPrice: ride.estimatedPrice || 0,

        // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
        stopovers: (ride.waypoints ?? []).map(
          (wp: any) => ({
            address: wp.address,
            name: wp.name,
            latitude: wp.latitude,
            longitude: wp.longitude
          })
        )
      // ENDE DER FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
      }))
    );
  }

  public deactivateRide() {
    return this.http.delete<Ride>(this.baseUrl)
  }

  public userHasActiveRide(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/has-active`);
  }

  private activeRideStatus = new BehaviorSubject<boolean>(false);
  public activeRideStatus$ = this.activeRideStatus.asObservable();

  updateActiveRideStatus(): void {
    this.userHasActiveRide().subscribe({
      next: status => this.activeRideStatus.next(status),
      error: err => console.error(err)
    });
  }
}
