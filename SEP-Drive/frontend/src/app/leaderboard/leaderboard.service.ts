import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private baseUrl = 'http://localhost:8080/api/trips/leaderboard';

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<DriverBoard[]> {
    return this.http.get<DriverBoard[]>(this.baseUrl);
  }
}

export interface DriverBoard {
  username: string;
  fullName: string;
  totalDistanceDriven: number;
  averageRating: number;
  totalDriveTime: number;
  numberOfRides: number;
  moneyEarned: number;
}
