import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {RideRequestService} from '../../services/ride-request.service';
import {Location} from '../../models/location.model';
import {Request} from '../../models/request.model';
import {filter, switchMap, tap} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';

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
export class RequestsListPageComponent implements OnInit {
  accessAllowed: boolean = false;
  username: string = '';

  allActiveRequests: Request[] = [];
  currentPositionControl = new FormControl<Location | string>('', [Validators.required]);
  currentPosition!: Location;
  positionSet = false;
  sortOptions: SortOption[] = [
    { key: 'driverToStartDistance', label: 'Distance to Pickup' },
    { key: 'desiredVehicleClass', label: 'Requested Vehicle Type' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerRating', label: 'Customer Rating' },
    { key: 'createdAt', label: 'Request Time' },
    { key: 'requestID', label: 'Request ID' },
  ];
  constructor(private rideService: RideRequestService,
              private authService: AuthService) {
  }

  onLocationSelected(pos: Location) {
    this.currentPosition = pos;
    this.currentPositionControl.setValue(pos);
    this.rideService.getAllActiveRequests(this.currentPosition.latitude,this.currentPosition.longitude).subscribe({
      next: result => this.allActiveRequests = result,
      error: err => console.log(err)
    })
    this.positionSet = true;
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
    this.allActiveRequests.sort(compare);
  }

  ngOnInit() {
    this.authService.currentUser.pipe(
      filter(user => !!user?.username),
      tap(user => this.username = user!.username!),
      switchMap(() => this.authService.isCustomer(this.username)),
      tap(isCustomer => this.accessAllowed = !isCustomer)
    ).subscribe()
  }
}
