import {VehicleClass} from './ride.model';

export enum OfferState {
  NONE,
  OFFERED,
  ACCEPTED
}

export interface Offer {
  offerID: number;
  driverUsername: string;
  driverName: string;
  driverRating: number;
  driverVehicle: VehicleClass;
  ridesCount: number;
  travelledDistance: number;
  state: OfferState;
}
