import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getMonthlyStats(year: number) {
    return this.http.get<any[]>(`${this.baseUrl}/monthly-stats`, {
      params: new HttpParams().set('year', year)
    });
  }

  getDailyStats(year: number, month: number) {
    return this.http.get<any[]>(`${this.baseUrl}/daily-stats`, {
      params: new HttpParams().set('year', year).set('month', month)
    });
  }
}
