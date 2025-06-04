import {Component, OnInit} from '@angular/core';
import {OfferService} from '../../services/offer.service';
import {Offer} from '../../models/offer.model';

@Component({
  selector: 'ride-offers-page',
  standalone: false,
  templateUrl: './ride-offers-page.component.html',
  styleUrl: './ride-offers-page.component.scss'
})
export class RideOffersPageComponent implements OnInit {
  offers: Offer[] = [];
  constructor(private offerService: OfferService) {}

  ngOnInit() {
    this.offerService.getOffers().subscribe({
      next: (offers: Offer[]) => this.offers = offers,
      error: err => console.log(err)
    })
  }
}
