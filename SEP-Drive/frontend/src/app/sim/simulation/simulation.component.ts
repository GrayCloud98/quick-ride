import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'simulation',
  standalone: false,
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: google.maps.Map;

  ngAfterViewInit(): void {
    const center = new google.maps.LatLng(52.52, 13.405); // TODO UPDATE WITH GEOLOCATION
    const options: google.maps.MapOptions = {
      center: center,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, options);
  }
}
