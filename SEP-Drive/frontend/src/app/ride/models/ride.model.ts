import {Location} from './location.model';

export interface Ride {
  id?: number;
  pickup: Location;
  dropoff: Location;
  vehicleClass: VehicleClass;
  active: boolean;
  distance: number;
  duration: number;
  estimatedPrice: number;
  stopovers?: Location[]; // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
}

export enum VehicleClass {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large'
}
