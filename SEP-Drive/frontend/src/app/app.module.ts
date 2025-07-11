import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { RideModule } from './ride/ride.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { RegisterComponent } from './auth/register/register.component';
import { TwoFaComponent } from './shared/components/two-fa/two-fa.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { WalletPageComponent } from './profile-page/wallet-page/wallet-page.component';
import { SimulationComponent } from './simulation/simulation-page/simulation.component';
import { RatingPopupComponent } from './simulation/rating-popup/rating-popup.component';
import { HomeComponent } from './home/home.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { ChatModalComponent } from './chat/chat-modal.component';

import { GoogleMapsModule } from '@angular/google-maps';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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

import { provideNativeDateAdapter } from '@angular/material/core';
import { SimulationService } from './simulation/simulation.service';
import { AuthInterceptor } from './auth/services/auth.interceptor';

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
    ChatModalComponent,
    LeaderboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    RideModule,
    ReactiveFormsModule,
    FormsModule,
    GoogleMapsModule,
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
    HttpClientModule,
    CommonModule,
    MatButtonToggleModule
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
