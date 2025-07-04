import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';

import { RideRoutingModule } from './ride-routing.module';

import { RequestRidePageComponent } from './pages/request-ride-page/request-ride-page.component';
import { RideFormComponent } from './components/ride-form/ride-form.component';
import { SelectLocationComponent } from './components/select-location/select-location.component';
import { MapComponent } from '../map/map.component';
import { ActiveRidePageComponent } from './pages/active-ride-page/active-ride-page.component';
import { LocationCardComponent } from './components/location-card/location-card.component';

import { AvailableRidesPageComponent } from './pages/available-rides-page/available-rides-page.component';
import { RequestCardComponent } from './components/request-card/request-card.component';
import { RideOffersPageComponent } from './pages/ride-offers-page/ride-offers-page.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { NotificationComponent } from './components/notification/notification.component';

import { GeolocationService } from './services/geolocation.service';
import { PlacesService } from './services/places.service';
import { RideRequestService } from './services/ride-request.service';
import { OfferService } from './services/offer.service';

import { SharedModule } from '../shared/shared.module';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    RequestRidePageComponent,
    RideFormComponent,
    SelectLocationComponent,
    MapComponent,
    ActiveRidePageComponent,
    LocationCardComponent,
    AvailableRidesPageComponent,
    RequestCardComponent,
    RideOffersPageComponent,
    OfferCardComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RideRoutingModule,
    GoogleMapsModule,
    GoogleMap,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    NotificationComponent,
    SharedModule
  ],
  providers: [
    GeolocationService,
    PlacesService,
    RideRequestService,
    OfferService
  ],
  exports: [
    NotificationComponent,
    SelectLocationComponent,
    LocationCardComponent
  ]
})
export class RideModule {}
