import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Request} from '../models/request.model';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Offer, OfferState} from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  baseUrl = 'http://localhost:8080/api/ride-requests';
  constructor(private http: HttpClient) { }

  public getAllActiveRequests(): Observable<Request[]>{

    return this.http.get<Request[]>(this.baseUrl + '/all-active-rides').pipe(
      map((response: any[]) => response.map(
        (request: any) => ({
          requestID: request.id,
          createdAt: request.createdAt,
          customerUsername: request.customerUsername,
          customerName: request.customerName,
          customerRating: request.customerRating,
          driverToPickupDistance: 0,
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
          },

          // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
          stopovers: (request.waypoints ?? []).map(
            (wp: any) => ({
              address: wp.address,
              name: wp.name,
              latitude: wp.latitude,
              longitude: wp.longitude
            })
          )
          // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
        })
      ))
    );
  }

  public customerGetOffers(): Observable<Offer[]> {
    return this.http.get<any[]>(this.baseUrl + '/offers').pipe(
      map((offers: any[]) => offers.map(
        (offer: any) => ({
          offerID: offer.rideOfferId,
          driverUsername: offer.driverUsername,
          driverName: offer.driverName,
          driverRating: offer.driverRating,
          driverVehicle: offer.vehicleClass,
          ridesCount: offer.totalRides,
          travelledDistance: offer.totalTravelledDistance,
          state: OfferState.OFFERED
        })
      ))
    );
  }

  public driverSendOffer(requestID: number) {
    const params = {rideRequestId: requestID};
    return this.http.post(this.baseUrl + '/offer-ride', null, {params});
  }

  public driverWithdrawOffer(){
    return this.http.delete(this.baseUrl + '/cancel-offer');
  }

  public driverHasActiveOffer(): Observable<boolean> {
    return this.http.get<boolean>(this.baseUrl + '/is-driver-active');
  }

  public driverGetRequestIdOfOffer(): Observable<number>{
    return this.http.get<number>(this.baseUrl + '/offer-request-id');
  }

  public customerAcceptOffer(offerID: number) {
    const params = {rideOfferId: offerID};
    return this.http.post(this.baseUrl + '/accept-offer', null, {params});
  }

  public customerRejectOffer(offerID: number) {
    const params = {rideOfferId: offerID};
    return this.http.delete(this.baseUrl + '/reject-offer', {params});
  }
}
