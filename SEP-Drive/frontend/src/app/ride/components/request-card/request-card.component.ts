import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Request} from '../../models/request.model'
import {OfferState} from '../../models/offer.model';

@Component({
  selector: 'request-card',
  standalone: false,
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.scss'
})
export class RequestCardComponent {
  @Input() request!: Request;
  @Input() offerState: OfferState = OfferState.NONE;
  @Input() RequestIdOfOffer: number | null = null;
  @Output() onAccept = new EventEmitter<void>();
  @Output() onWithdraw = new EventEmitter<void>();

  accept() {
    this.onAccept.emit();
  }

  withdraw() {
    this.onWithdraw.emit();
  }

  protected readonly OfferState = OfferState;
}
