import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Ride} from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  baseUrl = 'http://localhost:8080/api/ride-requests';
  constructor(private http: HttpClient) {}

  public submitRide(ride: any) {
    return this.http.post<Ride>(this.baseUrl, ride)
  }

  public getRide(username: string) {
    return this.http.get<Ride>(this.baseUrl + '/' + username)
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
