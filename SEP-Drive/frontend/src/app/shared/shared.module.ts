import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { UserNotFoundComponent } from './components/user-not-found/user-not-found.component';
import { RidehistoryComponent } from './components/ridehistory/ridehistory.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ChatComponent } from '../chat/chat.component';

import { AuthInterceptor } from '../auth/services/auth.interceptor';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    NavbarComponent,
    LoginDialogComponent,
    UserNotFoundComponent,
    RidehistoryComponent,
    StatisticsComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgOptimizedImage,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatCardModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatSelectModule,
    MatOptionModule,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    NavbarComponent,
    NgOptimizedImage,
    UserNotFoundComponent,
    ChatComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class SharedModule {}
