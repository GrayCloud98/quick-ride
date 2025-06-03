import {VehicleClass} from './ride.model';

export enum OfferStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

export interface Offer {
  offerID: number;
  requestID: number;
  driverID: number;
  driverName: string;
  driverRating: number;
  driverVehicle: VehicleClass;
  ridesCount: number;
  travelledDistance: number;
  status: OfferStatus;
}
