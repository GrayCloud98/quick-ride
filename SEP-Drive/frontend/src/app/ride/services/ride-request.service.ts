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

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = 'http://localhost:8080/api/ride-requests';
  }

  public submitRide(ride: any) {
    return this.http.post<Ride>(this.baseUrl, ride)
  }

  public getRide(): Observable<Ride> {
    return this.http.get<Ride>(this.baseUrl).pipe(
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
