import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {filter, switchMap, tap} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {OfferService} from '../../services/offer.service';
import {Location} from '../../models/location.model';
import {Request} from '../../models/request.model';
import {OfferState} from '../../models/offer.model';

interface SortOption {
  key: keyof Request,
  label: string
}
@Component({
  selector: 'requests-list',
  standalone: false,
  templateUrl: './available-rides-page.component.html',
  styleUrl: './available-rides-page.component.scss'
})
export class AvailableRidesPageComponent implements OnInit {
  accessAllowed: boolean = false;
  username: string = '';

  currentPositionControl = new FormControl<Location | string>('', [Validators.required]);
  currentPosition!: Location;
  positionSet = false;

  allActiveRequests: Request[] = [];
  sortOptions: SortOption[] = [
    { key: 'driverToStartDistance', label: 'Distance to Pickup' },
    { key: 'desiredVehicleClass', label: 'Requested Vehicle Type' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerRating', label: 'Customer Rating' },
    { key: 'createdAt', label: 'Request Time' },
    { key: 'requestID', label: 'Request ID' },
  ];

  offerState = OfferState.NONE;
  requestIdOfOffer: number | null = null;

  constructor(private offerService: OfferService,
              private authService: AuthService) {
  }

  onLocationSelected(pos: Location) {
    this.currentPosition = pos;
    this.currentPositionControl.setValue(pos);

    this.offerService.driverHasActiveOffer().pipe(
      filter(driverHasActiveOffer => driverHasActiveOffer),
      tap(()=> this.offerState = OfferState.OFFERED),
      switchMap(() => this.offerService.driverGetRequestIdOfOffer()),
      tap(requestIdOfOffer => this.requestIdOfOffer = requestIdOfOffer),
    ).subscribe({
      error: err => console.log(err)
    });

    this.offerService.getAllActiveRequests(this.currentPosition.latitude,this.currentPosition.longitude).subscribe({
      next: result => this.allActiveRequests = result,
      error: err => console.log(err)
    })
    this.positionSet = true;
  }

  acceptRequest(requestID: number) {
    this.offerService.driverAcceptRequest(requestID).subscribe({
      next: (response: any) => this.requestIdOfOffer = response.rideRequest.id,
      error: err => console.log(err)
    })
    this.offerState = OfferState.OFFERED;
  }

  withdrawOffer() {
    this.offerService.driverWithdrawOffer().subscribe({
      error: err => console.log(err)
    })
    this.offerState = OfferState.NONE;
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
      switchMap(() => this.authService.isCustomer()),
      tap(isCustomer => this.accessAllowed = !isCustomer)
    ).subscribe({
      error: err => console.log(err)
    })
  }
}
