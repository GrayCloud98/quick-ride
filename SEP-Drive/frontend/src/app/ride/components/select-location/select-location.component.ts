import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

import {Observable, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, catchError} from 'rxjs/operators';

import {PlacesService} from '../../services/places.service';
import {Location} from '../../models/location.model';

@Component({
  selector: 'select-location',
  standalone: false,
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss']
})
export class SelectLocationComponent implements OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Output() locationSelected = new EventEmitter<Location>();

  manualMode = false;
  latitude = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(-90),
    Validators.max(90)
  ]);

  longitude = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(-180),
    Validators.max(180)
  ]);

  filteredLocations!: Observable<Location[]>;

  constructor(private placesService: PlacesService) {
  }

  ngOnInit(): void {
    this.filteredLocations = this.control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => typeof value === 'string' ? value : value?.name || ''),
      switchMap(query => this.onSearch(query))
    );
  }

  onSearch(query: string): Observable<Location[]> {
    if (!query.trim()) return of([]);
    return this.placesService.searchPlaces(query).pipe(
      catchError(() => of([]))
    );
  }

  displayFn(location: Location | string): string {
    if (typeof location === 'string') return location;
    return location ? location.name || location.address || '' : '';
  }

  onLocationSelected(location: Location) {
    this.locationSelected.emit(location);
  }

  toggleManualMode(): void {
    this.manualMode = !this.manualMode;
  }

  useManualCoordinates(): void {
    if (this.latitude.valid && this.longitude.valid) {
      const loc: Location = {
        latitude: this.latitude.value!,
        longitude: this.longitude.value!,
        name: 'Manual Location',
      };
      this.control.setValue(loc);
      this.locationSelected.emit(loc);
      this.manualMode = false;
    }
  }
}
