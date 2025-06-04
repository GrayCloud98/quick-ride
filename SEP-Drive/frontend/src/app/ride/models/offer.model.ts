import {VehicleClass} from './ride.model';

export enum OfferState {
  NONE = 'none',
  OFFERED = 'offered',
  ACCEPTED = 'accepted'
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
  status: OfferState;
}
