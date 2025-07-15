import {VehicleClass} from './ride.model';
import {Location} from './location.model';


export interface Request {
  requestID: number;
  createdAt: string;
  customerName: string;
  customerUsername: string;
  customerRating: number;
  driverToPickupDistance: number;
  desiredVehicleClass: VehicleClass;
  pickup: Location;
  dropoff: Location;
  stopovers: Location[]; // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
}
