import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RideModule } from './ride/ride.module';
import {ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './auth/register/register.component';
import {TwoFaComponent} from  './shared/components/two-fa/two-fa.component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCardModule }       from '@angular/material/card';
import { MatButtonModule }     from '@angular/material/button';
import { MatSelectModule }     from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import {MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader} from '@angular/material/card';
import { GoogleMapsModule } from '@angular/google-maps';
import { RideSimulationComponent } from './simulation/ride-simulation/ride-simulation.component';
import { RideRatingDialogComponent } from './simulation/ride-rating-dialog/ride-rating-dialog.component';
import { WalletPageComponent } from './profile-page/wallet-page/wallet-page.component';
import {SimulationService} from './simulation/simulation.service';
import {MatSlider, MatSliderModule} from '@angular/material/slider';


@NgModule({
  declarations: [
    AppComponent,
    ProfilePageComponent,
    AppComponent,
    RegisterComponent,
    TwoFaComponent,
    RideSimulationComponent,
    RideRatingDialogComponent,
    WalletPageComponent
  ],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    RideModule,
    FormsModule,
    MatRadioGroup,
    MatRadioButton,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    MatIconButton,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButton,
    MatOption,
    MatSelect,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    GoogleMapsModule,
    MatSlider,
    MatSliderModule
  ],

  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideNativeDateAdapter(),
    SimulationService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
