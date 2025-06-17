import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class RideStateService {
// Holds the latest pickup and dropoff
private pickupLocationSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
private dropoffLocationSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);

pickupLocation$ = this.pickupLocationSubject.asObservable();
dropoffLocation$ = this.dropoffLocationSubject.asObservable();

setPickupLocation(location: { lat: number, lng: number } | null) {
    this.pickupLocationSubject.next(location);
  }

  setDropoffLocation(location: { lat: number, lng: number } | null) {
    this.dropoffLocationSubject.next(location);
  }

  resetLocations() {
    this.setPickupLocation(null);
    this.setDropoffLocation(null);
  }


}
