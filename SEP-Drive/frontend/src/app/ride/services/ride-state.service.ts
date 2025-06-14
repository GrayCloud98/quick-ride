import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class RideStateService {
private pickupLocationSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
private dropoffLocationSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
private currentRideIdSubject = new BehaviorSubject<string | null>(null);

pickupLocation$ = this.pickupLocationSubject.asObservable();
dropoffLocation$ = this.dropoffLocationSubject.asObservable();
currentRideId$ = this.currentRideIdSubject.asObservable();

get currentRideId(): string | null {
    return this.currentRideIdSubject.value;
  }

  setPickupLocation(location: { lat: number, lng: number } | null) {
    this.pickupLocationSubject.next(location);
  }

  setDropoffLocation(location: { lat: number, lng: number } | null) {
    this.dropoffLocationSubject.next(location);
  }

  setCurrentRideId(id: string) {
    this.currentRideIdSubject.next(id);
  }

  resetLocations() {
    this.setPickupLocation(null);
    this.setDropoffLocation(null);
  }
}
