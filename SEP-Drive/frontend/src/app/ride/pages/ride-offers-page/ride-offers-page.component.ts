import {Component, OnInit} from '@angular/core';
import {OfferService} from '../../services/offer.service';
import {Offer} from '../../models/offer.model';
// import {OfferState} from '../../models/offer.model'; // TEST CASE
// import {VehicleClass} from '../../models/ride.model'; // TEST CASE

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
    this.offerService.getOffers().subscribe({
      next: (offers: Offer[]) => this.offers = offers,
      error: err => console.log(err)
    })

    // TEST CASE
    // this.offers = [ { offerID: 1, driverName: 'Alice Müller', driverRating: 4.8, driverVehicle: VehicleClass.SMALL, ridesCount: 12, travelledDistance: 85.3, state: OfferState.OFFERED, }, { offerID: 2, driverName: 'Bob Schneider', driverRating: 4.5, driverVehicle: VehicleClass.MEDIUM, ridesCount: 34, travelledDistance: 203.7, state: OfferState.OFFERED, }, { offerID: 3, driverName: 'Clara König', driverRating: 4.9, driverVehicle: VehicleClass.LARGE, ridesCount: 58, travelledDistance: 521.4, state: OfferState.OFFERED, }, { offerID: 4, driverName: 'David Weber', driverRating: 4.1, driverVehicle: VehicleClass.SMALL, ridesCount: 7, travelledDistance: 40.2, state: OfferState.OFFERED, }, { offerID: 5, driverName: 'Eva Wagner', driverRating: 4.6, driverVehicle: VehicleClass.MEDIUM, ridesCount: 18, travelledDistance: 102.0, state: OfferState.OFFERED, }, { offerID: 6, driverName: 'Felix Becker', driverRating: 3.9, driverVehicle: VehicleClass.LARGE, ridesCount: 22, travelledDistance: 310.5, state: OfferState.OFFERED, }, { offerID: 7, driverName: 'Greta Hoffmann', driverRating: 5.0, driverVehicle: VehicleClass.SMALL, ridesCount: 44, travelledDistance: 220.1, state: OfferState.OFFERED, }, { offerID: 8, driverName: 'Hans Zimmer', driverRating: 4.3, driverVehicle: VehicleClass.MEDIUM, ridesCount: 16, travelledDistance: 78.8, state: OfferState.OFFERED, }, { offerID: 9, driverName: 'Isabel Neumann', driverRating: 4.7, driverVehicle: VehicleClass.LARGE, ridesCount: 31, travelledDistance: 402.6, state: OfferState.OFFERED, }, { offerID: 10, driverName: 'Jakob Schröder', driverRating: 4.4, driverVehicle: VehicleClass.SMALL, ridesCount: 10, travelledDistance: 65.9, state: OfferState.OFFERED, }, ];
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


}
