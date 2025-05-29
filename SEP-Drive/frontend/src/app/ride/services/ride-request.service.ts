import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Ride, VehicleClass} from '../models/ride.model';
import {Request} from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  baseUrl = 'http://localhost:8080/api/ride-requests';
  constructor(private http: HttpClient) {}

  public submitRide(ride: any) {
    return this.http.post<Ride>(this.baseUrl, ride)
  }

  public getRide(username: string): Observable<Ride> {
    return this.http.get<any>(`${this.baseUrl}/${username}`).pipe(
      map((ride: any) => ({
        pickup: {
          latitude: Number(ride.startLatitude),
          longitude: Number(ride.startLongitude),
          address: ride.startAddress || undefined,
          name: ride.startLocationName || undefined
        },
        dropoff: {
          latitude: Number(ride.destinationLatitude),
          longitude: Number(ride.destinationLongitude),
          address: ride.destinationAddress || undefined,
          name: ride.destinationLocationName || undefined
        },
        vehicleClass: ride.vehicleClass as VehicleClass,
        active: true
      }))
    );
  }

  public deactivateRide(username: string) {
    return this.http.delete<Ride>(this.baseUrl + '/' + username)
  }

  private activeRideStatus = new BehaviorSubject<boolean>(false);
  public activeRideStatus$ = this.activeRideStatus.asObservable();

  public updateActiveRideStatus(username: string) {
    this.http.get<boolean>(`${this.baseUrl}/${username}/has-active`).subscribe({
      next: activeRideStatus => this.activeRideStatus.next(activeRideStatus),
    })
  }
}
