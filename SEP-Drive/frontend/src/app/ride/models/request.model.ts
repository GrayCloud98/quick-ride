import {VehicleClass} from './ride.model';
import {Location} from './location.model';


export interface Request {
  requestID: string;
  createdAt: string;
  customerName: string;
  customerRating: number;
  driverToStartDistance: number;
  desiredVehicleClass: VehicleClass;
  pickup: Location;
  dropoff: Location;
}
