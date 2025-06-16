import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {map} from "rxjs/operators";

export interface TripHistoryDTO {
  id: number;
  date: string;
  distance: number;
  duration: string;
  money: number;
  customerRating: number;
  driverRating: number;
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

    // TODO: Replace mock data with actual backend integration once available
    const rideHistoryMock = [ { tripId: '#001', endTime: '10/06/2025 09:15', distanceKm: '8 km', durationMin: '15 min', priceEuro: 14, customerRating: 5, driverRating: 5, customerFullName: 'Meier', customerUsername: 'j.meier', driverUsername: 'l.krause', driverFullName: 'Krause' }, { tripId: '#002', endTime: '12/06/2025 18:47', distanceKm: '12 km', durationMin: '20 min', priceEuro: 20, customerRating: 4, driverRating: 5, customerFullName: 'Schmidt', customerUsername: 'lena.sch', driverUsername: 't.mueller', driverFullName: 'Müller' }, { tripId: '#003', endTime: '14/06/2025 22:10', distanceKm: '5 km', durationMin: '10 min', priceEuro: 9, customerRating: 5, driverRating: 4, customerFullName: 'Fischer', customerUsername: 'f.fischer', driverUsername: 'd.schneider', driverFullName: 'Schneider' }, { tripId: '#004', endTime: '08/06/2025 13:25', distanceKm: '15 km', durationMin: '25 min', priceEuro: 24, customerRating: 3, driverRating: 3, customerFullName: 'Wagner', customerUsername: 'w.wagner', driverUsername: 'm.bauer', driverFullName: 'Bauer' }, { tripId: '#005', endTime: '09/06/2025 07:55', distanceKm: '7 km', durationMin: '12 min', priceEuro: 12, customerRating: 4, driverRating: 4, customerFullName: 'Becker', customerUsername: 'a.becker', driverUsername: 'n.hoffmann', driverFullName: 'Hoffmann' }, { tripId: '#006', endTime: '11/06/2025 20:40', distanceKm: '18 km', durationMin: '30 min', priceEuro: 30, customerRating: 5, driverRating: 5, customerFullName: 'Koch', customerUsername: 'koch.l', driverUsername: 'g.schulz', driverFullName: 'Schulz' }, { tripId: '#007', endTime: '13/06/2025 16:18', distanceKm: '9 km', durationMin: '16 min', priceEuro: 16, customerRating: 4, driverRating: 3, customerFullName: 'Richter', customerUsername: 'r.richter', driverUsername: 'u.klein', driverFullName: 'Klein' }, { tripId: '#008', endTime: '06/06/2025 11:30', distanceKm: '6 km', durationMin: '11 min', priceEuro: 10, customerRating: 3, driverRating: 4, customerFullName: 'Neumann', customerUsername: 'neumann.m', driverUsername: 'z.schmitt', driverFullName: 'Schmitt' }, { tripId: '#009', endTime: '05/06/2025 19:05', distanceKm: '20 km', durationMin: '35 min', priceEuro: 32, customerRating: 5, driverRating: 5, customerFullName: 'Wolf', customerUsername: 'w.wolf', driverUsername: 'c.lang', driverFullName: 'Lang' }, { tripId: '#010', endTime: '07/06/2025 15:42', distanceKm: '10 km', durationMin: '18 min', priceEuro: 18, customerRating: 4, driverRating: 4, customerFullName: 'Schulz', customerUsername: 'alex.s', driverUsername: 'm', driverFullName: 'Müller' } ];
    return of(rideHistoryMock).pipe(
      map((rides: any[]) => rides.map(
        (ride: any) => ({
          id: ride.tripId,
          date: ride.endTime,
          distance: ride.distanceKm,
          duration: ride.durationMin,
          money: ride.priceEuro,
          customerRating: ride.customerRating,
          driverRating: ride.driverRating,
          customerName: ride.customerFullName,
          customerUsername: ride.customerUsername,
          driverName: ride.driverFullName,
          driverUsername: ride.driverUsername
        })
      ))
    );
    // END MOCK DATA

    // TODO: TEMPORARILY DISABLED: Uncomment when backend API is ready
    // return this.http.get<TripHistoryDTO[]>(this.apiUrl).pipe(
    //   map((rides: any[]) => rides.map(
    //     (ride: any) => ({
    //       id: ride.tripId,
    //       date: ride.endTime,
    //       distance: ride.distanceKm,
    //       duration: ride.durationMin,
    //       amount: ride.priceEuro,
    //       customerRating: ride.customerRating,
    //       driverRating: ride.driverRating,
    //       customerName: ride.customerFullName,
    //       customerUsername: ride.customerUsername,
    //       driverName: ride.driverFullName,
    //       driverUsername: ride.driverUsername
    //     })
    //   ))
    // );
  }
}
