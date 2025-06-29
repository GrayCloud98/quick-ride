import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { AuthInterceptor} from '../auth/services/auth.interceptor';
import {FormsModule} from '@angular/forms';
import { MatInput} from '@angular/material/input';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import { UserNotFoundComponent } from './components/user-not-found/user-not-found.component';
import { RidehistoryComponent } from './components/ridehistory/ridehistory.component';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import { StatisticsComponent } from './components/statistics/statistics.component';
import {MatCard} from '@angular/material/card';
import {MatRadioButton} from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';


@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    NavbarComponent,
    LoginDialogComponent,
    UserNotFoundComponent,
    RidehistoryComponent,
    StatisticsComponent,
  ],
  imports: [
    MatSortModule,
    CommonModule,
    MatToolbar,
    MatButton,
    RouterLink,
    FormsModule,
    MatSortModule,
    MatFormField,
    MatIconButton,
    MatInput,
    MatIcon,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    RouterLink,
    NgOptimizedImage,
    MatFormField,
    MatInputModule,
    MatIconButton,
    MatIcon,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatRow,
    MatHeaderRow,
    MatRowDef,
    MatHeaderRowDef,
    MatProgressSpinnerModule,
    MatCard,
    MatRadioButton,
    MatCardModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatSelectModule,
    MatOptionModule
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    NavbarComponent,
    NgOptimizedImage,
    UserNotFoundComponent
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
})
export class SharedModule { }
