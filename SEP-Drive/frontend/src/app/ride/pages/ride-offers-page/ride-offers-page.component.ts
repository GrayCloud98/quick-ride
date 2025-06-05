import {Component, OnInit} from '@angular/core';
import {OfferService} from '../../services/offer.service';
import {Offer} from '../../models/offer.model';

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
  offers: Offer[] = [];
  sortOptions: SortOption[] = [
    { key: 'offerID', label: 'Offer ID' },
    { key: 'driverName', label: 'Driver Name' },
    { key: 'driverRating', label: 'Driver Rating' },
    { key: 'driverVehicle', label: 'Driver Vehicle' },
    { key: 'ridesCount', label: 'Rides Count' },
    { key: 'travelledDistance', label: 'Travelled Distance' },
  ];
  constructor(private offerService: OfferService) {}

  ngOnInit() {
    this.offerService.customerGetOffers().subscribe({
      next: (offers: Offer[]) => this.offers = offers,
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

  acceptOffer(offerID: number) {
    this.offerService.customerAcceptOffer(offerID).subscribe({
      next: () => {
        const otherOffers = this.offers.filter(offer => offer.offerID !== offerID);
        otherOffers.forEach(offer => this.rejectOffer(offer.offerID));
      },
      error: err => console.error(err)
    });
  }

  rejectOffer(offerID: number) {
    this.offerService.customerRejectOffer(offerID).subscribe({
      next: () => this.offers = this.offers.filter(offer => offer.offerID !== offerID),
      error: err => console.log(err)
    })
  }
}
