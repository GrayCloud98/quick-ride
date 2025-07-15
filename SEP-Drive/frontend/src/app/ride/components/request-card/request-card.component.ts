import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Request } from '../../models/request.model';
import { OfferState } from '../../models/offer.model';
import { MatDialog } from '@angular/material/dialog';
import { ChatModalComponent } from '../../../chat/chat-modal.component';

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
  @Input() driverUsername!: string;
  @Output() onAccept = new EventEmitter<void>();
  @Output() onWithdraw = new EventEmitter<void>();

  showStopovers = false;

  displayedColumns: string[] = ['position', 'name', 'address', 'latitude', 'longitude'];

  constructor(private dialog: MatDialog) {}

  accept() {
    this.onAccept.emit();
  }

  withdraw() {
    this.onWithdraw.emit();
  }

  // FAHRTEN MIT MEHREREN ZWISCHENSTOPPS
  get dataSource() {
    return this.request.stopovers.map((stop, index) => ({
      position: index + 1,
      name: stop.name,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude
    }));
  }
  // ENDE DER FAHRTEN MIT MEHREREN ZWISCHENSTOPPS

  openChat(): void {
    const recipientUsername = this.request.customerUsername;

    console.log('[CHAT] Opening chat with recipient:', recipientUsername);

    const chatId = `offer-${this.driverUsername}-${recipientUsername}`;

    this.dialog.open(ChatModalComponent, {
      width: '600px',
      data: {
        chatId,
        username: this.driverUsername,
        recipient: recipientUsername
      }
    });
  }

  protected readonly OfferState = OfferState;
  hasUnreadMessages = false;
}
