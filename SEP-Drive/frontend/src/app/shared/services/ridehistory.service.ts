import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, } from 'rxjs';
import {map} from "rxjs/operators";

export interface TripHistoryDTO {
  id: number;
  date: string;
  distance: number;
  duration: string;
  amount: number;
  customerRating?: number;
  driverRating?: number;
  customerName: string;
  customerUsername: string;
  driverName: string;
  driverUsername: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideHistoryService {
  private apiUrl = 'http://localhost:8080/api/ride-requests/history';

  constructor(private http: HttpClient) {}

  getTripHistory(): Observable<TripHistoryDTO[]> {
    return this.http.get<TripHistoryDTO[]>(this.apiUrl).pipe(
      map((rides: any[]) => rides.map((ride: any) => ({
        id: ride.rideId,
        date: ride.endTime,
        distance: ride.distance,
        duration: ride.duration,
        amount: ride.fees,
        customerRating: ride.customerRating,
        driverRating: ride.driverRating,
        customerName: ride.customerName,
        customerUsername: ride.customerUsername,
        driverName: ride.driverName,
        driverUsername: ride.driverUsername
      })))
    );
  }
}

