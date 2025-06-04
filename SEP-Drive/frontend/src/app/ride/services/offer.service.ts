import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Request} from '../models/request.model';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Offer, OfferState} from '../models/offer.model';
import {VehicleClass} from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  baseUrl = 'http://localhost:8080/api/ride-requests';
  constructor(private http: HttpClient) { }

  public getAllActiveRequests(driverLat: number, driverLon: number): Observable<Request[]>{
    const body = {
      driverLat: driverLat,
      driverLon: driverLon
    }

    return this.http.post<Request[]>(this.baseUrl + '/all-active-rides', body).pipe(
      map((response: any[]) => response.map(
        (request: any) => ({
          requestID: request.id,
          createdAt: request.createdAt,
          customerName: request.customerName,
          customerRating: request.customerRating,
          driverToStartDistance: request.distanceFromDriver,
          desiredVehicleClass: request.requestedVehicleClass,
          pickup: {
            latitude: request.startLatitude,
            longitude: request.startLongitude,
            address: request.startAddress,
            name: request.startLocationName
          },
          dropoff: {
            latitude: request.destinationLatitude,
            longitude: request.destinationLongitude,
            address: request.destinationAddress,
            name: request.destinationLocationName
          }
        })
      ))
    );
  }

  public getOffers(): Observable<Offer[]> {
    return this.http.get<any[]>(this.baseUrl + '/offers').pipe(
      map((offers: any[]) => offers.map(
        (offer: any) => ({
          offerID: offer.rideOfferId,
          driverName: offer.driverUsername,
          driverRating: offer.driverRating,
          driverVehicle: VehicleClass.SMALL, // Backend not implemented
          ridesCount: offer.totalRides,
          travelledDistance: 1313, // Backend not implemented
          status: OfferState.OFFERED
        })
      ))
    );
  }

  public driverAcceptRequest(requestID: number) {
    const params = {rideRequestId: requestID};
    return this.http.post(this.baseUrl + '/offer-ride', null, {params});
  }
}
