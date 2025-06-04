import { Component } from '@angular/core';
// import {Offer, OfferStatus} from '../../models/offer.model';
import {VehicleClass} from '../../models/ride.model';

@Component({
  selector: 'app-ride-offers-page',
  standalone: false,
  templateUrl: './ride-offers-page.component.html',
  styleUrl: './ride-offers-page.component.scss'
})
export class RideOffersPageComponent {
  // offers: Offer[] = [ { offerID: 35, requestID: 1001, driverID: 501, driverName: 'Alice Wagner', driverRating: 4.9, driverVehicle: VehicleClass.SMALL, ridesCount: 150, travelledDistance: 3200, status: OfferStatus.PENDING }, { offerID: 45, requestID: 1001, driverID: 3654, driverName: 'Boris Meier', driverRating: 4.6, driverVehicle: VehicleClass.MEDIUM, ridesCount: 98, travelledDistance: 2700, status: OfferStatus.PENDING }, { offerID: 48, requestID: 1001, driverID: 153, driverName: 'Clara Neumann', driverRating: 4.7, driverVehicle: VehicleClass.LARGE, ridesCount: 120, travelledDistance: 4100, status: OfferStatus.PENDING }, { offerID: 389, requestID: 1001, driverID: 789, driverName: 'Daniel Krüger', driverRating: 4.4, driverVehicle: VehicleClass.MEDIUM, ridesCount: 85, travelledDistance: 2200, status: OfferStatus.PENDING }, { offerID: 68, requestID: 1001, driverID: 33, driverName: 'Eva Hoffmann', driverRating: 4.8, driverVehicle: VehicleClass.SMALL, ridesCount: 110, travelledDistance: 3100, status: OfferStatus.PENDING } ];
}
