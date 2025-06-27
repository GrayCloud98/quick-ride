import {Location} from './location.model';

export interface Ride {
  id?: number;
  pickup: Location;
  dropoff: Location;
  stopovers?: Location[];
  vehicleClass: VehicleClass;
  active: boolean;
  distance: number;
  duration: number;
  estimatedPrice: number;
}

export enum VehicleClass {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large'
}
