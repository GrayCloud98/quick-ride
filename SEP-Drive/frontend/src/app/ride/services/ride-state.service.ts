import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class RideStateService {

private pickupLocationSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
private dropoffLocationSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
private stopoversSubject = new BehaviorSubject<{ lat: number, lng: number }[]>([]);
stopovers$ = this.stopoversSubject.asObservable();

pickupLocation$ = this.pickupLocationSubject.asObservable();
dropoffLocation$ = this.dropoffLocationSubject.asObservable();

setPickupLocation(location: { lat: number, lng: number } | null) {
    this.pickupLocationSubject.next(location);
  }

  setDropoffLocation(location: { lat: number, lng: number } | null) {
    this.dropoffLocationSubject.next(location);
  }

  setStopovers(locations: { lat: number, lng: number }[]) {
    this.stopoversSubject.next(locations);
  }

  resetLocations() {
    this.setPickupLocation(null);
    this.setDropoffLocation(null);
    this.setStopovers([]);
  }


}
