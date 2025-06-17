import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {VehicleClass} from '../ride/models/ride.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private baseUrl = 'http://localhost:8080/api/ride-requests';
  constructor(private http: HttpClient) {
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

  public postUpdateSimulation(simulation: Simulation) {

    const body = {
      currentLat: simulation.currentLat,
      currentLng: simulation.currentLng,
      status: simulation.status,
      simulationSpeed: simulation.simulationSpeed
    }

    return this.http.post<any>(`${this.baseUrl}/ride-request/${simulation.rideId}/simulation`, body)
  }

  public getUpdateSimulation(id: number): Observable<SimulationUpdate> {
    return this.http.get<any>(`${this.baseUrl}/ride-request/${id}/simulation`).pipe(
      map((update: any) => ({
        currentLat: update.currentLat,
        currentLng: update.currentLng,
        status: update.status,
        simulationSpeed: update.simulationSpeed
      }))
    );
  }

  rating(id: number, rating: number) {
    console.log('ratingService 😂', id, rating);
    return this.http.post(
      this.baseUrl + '/rate',
      null,
      {
        params: {
          rideId: id.toString(),
          rating: rating.toString()
        }
      }
    );
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

export interface SimulationUpdate {
  currentLat: number,
  currentLng: number,
  status: SimulationStatus,
  simulationSpeed: number
}
