import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Location} from '../../models/location.model';
import {VehicleClass} from '../../models/ride.model';
import {Request} from '../../models/request.model';

interface SortOption {
  key: keyof Request,
  label: string
}
@Component({
  selector: 'requests-list',
  standalone: false,
  templateUrl: './requests-list-page.component.html',
  styleUrl: './requests-list-page.component.scss'
})
export class RequestsListPageComponent {
  // TODO bind activeRides to an actual backend query
  activeRequests: Request[] = [ { pickup: { name: "Union Station", address: "700 N Alameda St, Los Angeles, CA", latitude: 34.0562, longitude: -118.2365 }, dropoff: { name: "Santa Monica Pier", address: "200 Santa Monica Pier, Santa Monica, CA", latitude: 34.0094, longitude: -118.4973 }, requestID: "f3a2b1c4-d3e5-48f6-b85f-0a3b582dcd78", createdAt: "2025-05-24T08:35:00Z", driverToStartDistance: 2.5, customerName: "John Doe", customerRating: 4.5, desiredVehicleClass: VehicleClass.SMALL }, { pickup: { name: "Millennium Park", address: "201 E Randolph St, Chicago, IL", latitude: 41.8826, longitude: -87.6226 }, dropoff: { name: "Navy Pier", address: "600 E Grand Ave, Chicago, IL", latitude: 41.8916, longitude: -87.6079 }, requestID: "d9f8a36d-2d4c-44f5-b9b4-7d763973b703", createdAt: "2025-05-24T09:12:00Z", driverToStartDistance: 1.8, customerName: "Jane Smith", customerRating: 0.3, desiredVehicleClass: VehicleClass.MEDIUM }, { pickup: { name: "Times Square", address: "Manhattan, NY 10036", latitude: 40.7580, longitude: -73.9855 }, dropoff: { name: "Central Park", address: "Central Park, New York, NY", latitude: 40.7829, longitude: -73.9654 }, requestID: "b6a2e467-f412-4d94-a460-e9462d3b75c2", createdAt: "2025-05-24T10:00:00Z", driverToStartDistance: 3.2, customerName: "Michael Johnson", customerRating: 4.2, desiredVehicleClass: VehicleClass.SMALL }, { pickup: { name: "Pike Place Market", address: "85 Pike St, Seattle, WA", latitude: 47.6097, longitude: -122.3425 }, dropoff: { name: "Space Needle", address: "400 Broad St, Seattle, WA", latitude: 47.6205, longitude: -122.3493 }, requestID: "8d7d37a9-2f6e-42c7-b8c8-25c5d1a8f403", createdAt: "2025-05-24T11:20:00Z", driverToStartDistance: 1.0, customerName: "Emily Williams", customerRating: 4.7, desiredVehicleClass: VehicleClass.LARGE }, { pickup: { name: "Golden Gate Bridge", address: "Golden Gate Bridge, San Francisco, CA", latitude: 37.8199, longitude: -122.4783 }, dropoff: { name: "Fisherman's Wharf", address: "Jefferson St, San Francisco, CA", latitude: 37.8080, longitude: -122.4177 }, requestID: "8c0a5b5e-9cdb-4c69-89ac-1d345e3a3ed6", createdAt: "2025-05-24T13:45:00Z", driverToStartDistance: 2.1, customerName: "David Lee", customerRating: 5.0, desiredVehicleClass: VehicleClass.MEDIUM } ];

  currentPositionControl = new FormControl<Location | string>('', [Validators.required]);
  currentPosition!: Location;
  sortOptions: SortOption[] = [
    { key: 'driverToStartDistance', label: 'Distance to Pickup' },
    { key: 'desiredVehicleClass', label: 'Requested Vehicle Type' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerRating', label: 'Customer Rating' },
    { key: 'createdAt', label: 'Requested at' },
    { key: 'requestID', label: 'Request ID' },
  ];

  onLocationSelected(location: Location) {
    this.currentPosition = location;
    this.currentPositionControl.setValue(location);
  }

  //TODO implement accepting logic
  acceptRequest() {
    console.log("accepted")
  }

  sortRequests(attr: keyof Request, direction: 'asc' | 'desc') {
    const compare = (a: Request, b: Request) => {
      let valA = a[attr];
      let valB = b[attr];

      if (attr === 'createdAt') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }

      if (valA == null) return -1;
      if (valB == null) return 1;

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    };

    this.activeRequests.sort(compare);
  }
}




