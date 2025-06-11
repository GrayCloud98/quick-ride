import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {OfferService} from '../../services/offer.service';
import {Offer} from '../../models/offer.model';
import {filter, switchMap, tap} from 'rxjs';

interface SortOption {
  key: keyof Offer,
  label: string
}
@Component({
  selector: 'ride-offers-page',
  standalone: false,
  templateUrl: './ride-offers-page.component.html',
  styleUrl: './ride-offers-page.component.scss'
})
export class RideOffersPageComponent implements OnInit {
  accessAllowed: boolean = false;
  username: string = '';

  offers: Offer[] = [];
  sortOptions: SortOption[] = [
    { key: 'offerID', label: 'Offer ID' },
    { key: 'driverName', label: 'Driver Name' },
    { key: 'driverRating', label: 'Driver Rating' },
    { key: 'driverVehicle', label: 'Driver Vehicle' },
    { key: 'ridesCount', label: 'Rides Count' },
    { key: 'travelledDistance', label: 'Travelled Distance' },
  ];
  constructor(private authService: AuthService,
              private offerService: OfferService) {}

  acceptOffer(offerID: number) {
    this.offerService.customerAcceptOffer(offerID).subscribe({
      next: response => console.log(response),
      error: err => console.error(err)
    });
  }

  rejectOffer(offerID: number) {
    this.offerService.customerRejectOffer(offerID).subscribe({
      next: () => this.offers = this.offers.filter(offer => offer.offerID !== offerID),
      error: err => console.log(err)
    })
  }

  sortOffers(attr: keyof Offer, direction: 'asc' | 'desc') {
    const compare = (a: Offer, b: Offer) => {
      let valA = a[attr];
      let valB = b[attr];

      if (valA == null) return -1;
      if (valB == null) return 1;

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    };
    this.offers.sort(compare);
  }

  ngOnInit() {
    this.authService.currentUser.pipe(
      filter(user => !!user?.username),
      tap(user => this.username = user!.username!),
      switchMap(() => this.authService.isCustomer()),
      tap(isCustomer => this.accessAllowed = isCustomer)
    ).subscribe({
      error: err => console.log(err)
    })

    this.offerService.customerGetOffers().subscribe({
      next: (offers: Offer[]) => {
        this.offers = offers;
        console.log(offers)
      },
      error: err => console.log(err)
    })
  }
}
