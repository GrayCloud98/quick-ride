import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer } from '../../models/offer.model';
import { MatDialog } from '@angular/material/dialog';
import { ChatModalComponent } from '../../../chat/chat-modal.component';

@Component({
  selector: 'offer-card',
  standalone: false,
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss']
})

export class OfferCardComponent {
  @Input() offer!: Offer;
  @Input() customerUsername!: string;
  @Output() onAccept = new EventEmitter<void>();
  @Output() onReject = new EventEmitter<void>();
  hasUnreadMessages = false;

  constructor(private dialog: MatDialog) {}

  accept() {
    this.onAccept.emit();
  }

  reject() {
    this.onReject.emit();
  }

  openChat(): void {
    const chatId = `offer-${this.customerUsername}-${this.offer.driverUsername}`;

    this.dialog.open(ChatModalComponent, {
      width: '600px',
      data: {
        chatId,
        username: this.customerUsername,
        recipient: this.offer.driverUsername
      }
    });
  }
}
