import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {OfferService} from '../../services/offer.service';
import {Offer} from '../../models/offer.model';
import {RideRequestService} from '../../services/ride-request.service';
import {Router} from '@angular/router';
import {SimulationService} from '../../../simulation/simulation.service';

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
  userHasActiveSimulation: boolean = false;
  username!: string;
  offers: Offer[] = [];
  sortOptions: SortOption[] = [
    { key: 'driverName', label: 'Driver Name' },
    { key: 'driverRating', label: 'Driver Rating' },
    { key: 'driverVehicle', label: 'Driver Vehicle' },
    { key: 'ridesCount', label: 'Rides Count' },
    { key: 'travelledDistance', label: 'Travelled Distance' },
    { key: 'offerID', label: 'Offer ID' },
  ];

  constructor(private authService: AuthService,
              private rideService: RideRequestService,
              private offerService: OfferService,
              private simService: SimulationService,
              private router: Router) {}

  acceptOffer(offerID: number) {
    this.offerService.customerAcceptOffer(offerID).subscribe({
      next: () => {
        this.rideService.updateActiveRideStatus();
        this.simService.updateActiveSimulationStatus();
        void this.router.navigate(['/simulation'])
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
    if(this.authService.currentUserValue) {
      this.username = this.authService.currentUserValue.username;
      this.accessAllowed = this.authService.currentUserValue.role === 'Customer'
      this.simService.activeSimulationStatus$.subscribe({
        next: userHasActiveSimulation => this.userHasActiveSimulation = userHasActiveSimulation
      })
    }
    if(!this.accessAllowed || this.userHasActiveSimulation) return;

    this.loadOffers();
  }

  loadOffers(){
    this.offerService.customerGetOffers().subscribe({
      next: (offers: Offer[]) => this.offers = offers,
      error: err => console.log(err)
    })
  }
}
