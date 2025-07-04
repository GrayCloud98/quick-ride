import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer } from '../../models/offer.model';

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

  toggleChat = false;
  chatId!: string;

  ngOnInit() {
    console.log('[OfferCardComponent] Loaded with offer:', this.offer);
    console.log('[OfferCardComponent] Customer username:', this.customerUsername);

    if (this.customerUsername && this.offer?.driverUsername) {
      const safeCustomer = this.customerUsername.replace(/\s+/g, '_');
      const safeDriver = this.offer.driverUsername.replace(/\s+/g, '_');
      this.chatId = `offer-${safeCustomer}-${safeDriver}`;
    } else {
      console.warn('[OfferCardComponent] Cannot generate chatId, missing values:', {
        customer: this.customerUsername,
        driver: this.offer?.driverUsername
      });
    }
  }

  accept() {
    this.onAccept.emit();
  }

  reject() {
    this.onReject.emit();
  }
}
