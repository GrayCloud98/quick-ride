import {VehicleClass} from './ride.model';

export enum OfferState {
  NONE,
  OFFERED,
  ACCEPTED
}

export interface Offer {
  offerID: number;
  driverName: string;
  driverRating: number;
  driverVehicle: VehicleClass; // Backend not implemented
  ridesCount: number;
  travelledDistance: number; // Backend not implemented
  state: OfferState;
}
