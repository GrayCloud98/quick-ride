import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Ride, VehicleClass} from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  private baseUrl= 'http://localhost:8080/api/ride-requests';
  constructor(private http: HttpClient) {}

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
      distance : ride.distance,
      duration : ride.duration,
      estimatedPrice: ride.estimatedPrice
    };

    return this.http.post<Ride>(this.baseUrl, rideJson);
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
        active: true,
        distance: Number(ride.distance) || 0,
        duration: Number(ride.duration) || 0,
        estimatedPrice: Number(ride.estimatedPrice) || 0
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


  public getAcceptedRideDetails(): Observable<Simulation> {
    return this.http.get<any>(this.baseUrl + '/rides/accepted').pipe(
      map((simulation: any) => ({
        rideId: simulation.rideId,
        status: simulation.status,
        startLat: simulation.startLat,
        startLng: simulation.startLng,
        destLat: simulation.destLat,
        destLng: simulation.destLng,
        currentLat: simulation.currentLat,
        currentLng: simulation.currentLng,
        simulationSpeed: simulation.simulationSpeed,
        estimatedPrice: simulation.estimatedPrice,
        customerUsername: simulation.customerUsername,
        driverUsername: simulation.driverUsername,
        driverFullName: simulation.driverFullName,
        vehicleClass: simulation.vehicleClass,
        driverRating: simulation.driverRating
      }))
    );
}
public submitRideRating(rideId: number, rating: number, feedback: string) {
  return this.http.post('http://localhost:8080/api/rides/rate', {
    rating,
    feedback
  });
}
}

export enum SimulationStatus {
  PLANNED,
  IN_PROGRESS,
  PAUSED,
  COMPLETED
}

export interface Simulation {
      rideId: number,
      status: SimulationStatus,
      startLat: number,
      startLng: number,
      destLat: number,
      destLng: number,
      currentLat: number,
      currentLng: number,
      simulationSpeed: number,
      estimatedPrice: number,
      customerUsername: string,
      driverUsername: string,
      driverFullName: string,
      vehicleClass: VehicleClass,
      driverRating: string
}
