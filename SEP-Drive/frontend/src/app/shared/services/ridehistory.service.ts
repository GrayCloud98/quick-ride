import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RideHistoryDTO {
  id: number;
  date: string;
  distance: number;
  duration: string;
  amount: number;
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
  private apiUrl = 'http://localhost:8080/api/ride-requests/history';

  constructor(private http: HttpClient) { }

  getRideHistory(): Observable<RideHistoryDTO[]> {
    return this.http.get<RideHistoryDTO[]>(this.apiUrl);
  }
}
