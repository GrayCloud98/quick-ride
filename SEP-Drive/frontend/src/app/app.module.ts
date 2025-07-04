import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { RideModule } from './ride/ride.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RegisterComponent } from './auth/register/register.component';
import { TwoFaComponent } from './shared/components/two-fa/two-fa.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { WalletPageComponent } from './profile-page/wallet-page/wallet-page.component';
import { SimulationComponent } from './simulation/simulation-page/simulation.component';
import { RatingPopupComponent } from './simulation/rating-popup/rating-popup.component';
import { HomeComponent } from './home/home.component';

import { GoogleMapsModule } from '@angular/google-maps';

import { SimulationService } from './simulation/simulation.service';
import { AuthInterceptor } from './auth/services/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatSliderModule } from '@angular/material/slider';
import { ChatModalComponent } from './chat/chat-modal.component';
import { provideNativeDateAdapter } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    TwoFaComponent,
    ProfilePageComponent,
    WalletPageComponent,
    SimulationComponent,
    RatingPopupComponent,
    HomeComponent,
    ChatModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    RideModule,
    ReactiveFormsModule,
    FormsModule,
    GoogleMapsModule,

    // Material modules
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCardModule,
    MatDialogModule,
    MatSortModule,
    MatSliderModule,
    HttpClientModule
  ],
  providers: [
    provideNativeDateAdapter(),
    SimulationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
