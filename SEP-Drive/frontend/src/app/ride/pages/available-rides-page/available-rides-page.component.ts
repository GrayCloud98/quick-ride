import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {filter, of, switchMap, tap} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {OfferService} from '../../services/offer.service';
import {Location} from '../../models/location.model';
import {Request} from '../../models/request.model';
import {OfferState} from '../../models/offer.model';
import {DistanceService} from '../../services/distance.service';
import { Router } from '@angular/router';
import { RideSocketService } from '../../services/ride-socket.service'; // correct path

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
    { key: 'driverToPickupDistance', label: 'Distance to Pickup' },
    { key: 'desiredVehicleClass', label: 'Requested Vehicle Type' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerRating', label: 'Customer Rating' },
    { key: 'createdAt', label: 'Request Time' },
    { key: 'requestID', label: 'Request ID' },
  ];

  offerState = OfferState.NONE;
  requestIdOfOffer: number | null = null;

  constructor(private offerService: OfferService,
              private authService: AuthService,
              private distanceService: DistanceService,
              private router: Router,
              private rideSocketService: RideSocketService) {
  }

  onLocationSelected(pos: Location) {
    this.currentPosition = pos;
    this.currentPositionControl.setValue(pos);
    this.loadRequests();
    this.positionSet = true;
  }

  sendOffer(requestID: number) {
    this.offerService.driverSendOffer(requestID).subscribe({
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
  });

  // ✅ Connect WebSocket and subscribe to ride acceptance for synchronization
  this.rideSocketService.connect();

  this.offerService.driverGetRequestIdOfOffer().subscribe(rideRequestId => {
    if (rideRequestId) {
      this.rideSocketService.subscribeToRideAccepted(rideRequestId);

      this.rideSocketService.acceptedRide$.subscribe(() => {
        console.log("🚦 Driver notified: Ride accepted by customer");
        this.router.navigate(['/simulation'], {
          queryParams: {
            rideId: rideRequestId,
            role: 'driver'
          }
        });
      });
    }
  });
}


  loadRequests(){
    this.offerService.driverHasActiveOffer().pipe(
      switchMap(driverHasActiveOffer => {
        if (driverHasActiveOffer) {
          this.offerState = OfferState.OFFERED;
          return this.offerService.driverGetRequestIdOfOffer().pipe(
            tap(requestId => this.requestIdOfOffer = requestId)
          );
        } else {
          this.offerState = OfferState.NONE;
          this.requestIdOfOffer = null;
          return of([]);
        }
      })
    ).subscribe({
      error: err => console.log(err)
    });

    this.offerService.getAllActiveRequests().subscribe({
      next: result => {
        this.allActiveRequests = result;

        this.allActiveRequests.forEach(
          request => {
            this.distanceService.getDistanceDurationAndPrice(
              { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude },
              { lat: request.pickup.latitude, lng: request.pickup.longitude },
              request.desiredVehicleClass
            ).then(res => {
              request.driverToPickupDistance = res.distance;
            }).catch(err => console.error('Google Distance API error', err));
          }
        );
      },
      error: err => console.log(err)
    });
  }
}
