import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Request} from '../../models/request.model'

@Component({
  selector: 'request-card',
  standalone: false,
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.scss'
})
export class RequestCardComponent {
  @Input() request!: Request;
  @Output() onAccept = new EventEmitter<void>();

  accept() {
    this.onAccept.emit();
  }
}
