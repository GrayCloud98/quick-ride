import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RideRoutingModule} from './ride-routing.module';

import {GeolocationService} from './services/geolocation.service';
import {PlacesService} from './services/places.service';
import {RideRequestService} from './services/ride-request.service';

import {RideFormComponent} from './components/ride-form/ride-form.component';
import {RequestRidePageComponent} from './pages/request-ride/request-ride-page.component';

import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButton, MatFabButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {SelectLocationComponent} from './components/location-autocomplete/select-location.component';
import {MatRadioModule} from '@angular/material/radio';
import {ActiveRidePageComponent} from './pages/active-ride-page/active-ride-page.component';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {LocationCardComponent} from './components/location-card/location-card.component';

import {GoogleMap, GoogleMapsModule} from '@angular/google-maps';
import { MapComponent } from '../map/map.component'

@NgModule({
  declarations: [
    RideFormComponent,
    SelectLocationComponent,
    RequestRidePageComponent,
    ActiveRidePageComponent,
    LocationCardComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    RideRoutingModule,

    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatButton,
    MatFabButton,
    MatRadioModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    GoogleMap,
    GoogleMapsModule
  ],
  providers: [
    GeolocationService,
    PlacesService,
    RideRequestService
  ]
})
export class RideModule {
}
