import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Location} from '../../models/location.model';

@Component({
  selector: 'app-location-card',
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss'],
  standalone: false
})
export class LocationCardComponent {
  @Input() location!: Location;
  @Input() label: string = 'Location';
  @Input() removable = false;
  @Input() isSimulationPaused = true;
  @Output() onRemove = new EventEmitter<void>();

  remove(){
    this.onRemove.emit();
  }
}
