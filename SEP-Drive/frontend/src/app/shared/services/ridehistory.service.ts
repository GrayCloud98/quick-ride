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
  private apiUrl = 'http://localhost:8080/api/trips/history';

  constructor(private http: HttpClient) {
  }

  getTripHistory(): Observable<TripHistoryDTO[]> {
    return this.http.get<TripHistoryDTO[]>(this.apiUrl).pipe(
      map((rides: any[]) => {
        // Map & filter for unique trips based on id (tripId)
        const seen = new Set();
        return rides
          .map((ride: any) => ({
            id: ride.tripId,
            date: ride.endTime,
            distance: ride.distanceKm,
            duration: ride.durationMin,
            amount: ride.priceEuro,
            customerRating: ride.customerRating,
            driverRating: ride.driverRating,
            customerName: ride.customerFullName,
            customerUsername: ride.customerUsername,
            driverName: ride.driverFullName,
            driverUsername: ride.driverUsername
          }))
          .filter(ride => {
            if (seen.has(ride.distance)) return false;
            seen.add(ride.distance);
            return true;
          });
      })
    );
  }
}

