import {Component, Input} from '@angular/core';
import {Offer} from '../../models/offer.model';

@Component({
  selector: 'offer-card',
  standalone: false,
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss'
})
export class OfferCardComponent {
  @Input() offer!: Offer;
}
