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

  showStopovers = false;

  accept() {
    this.onAccept.emit();
  }

  withdraw() {
    this.onWithdraw.emit();
  }


  displayedColumns: string[] = ['position', 'name', 'address', 'latitude', 'longitude'];

  get dataSource() {
    return this.request.stopovers.map((stop, index) => ({
      position: index + 1,
      name: stop.name,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude
    }))
  }

  protected readonly OfferState = OfferState;
}
