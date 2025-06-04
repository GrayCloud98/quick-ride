import { NgModule } from '@angular/core';
import { TwoFaComponent } from  './shared/components/two-fa/two-fa.component';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { RideRoutingModule } from './ride/ride-routing.module';
import { WalletPageComponent } from './profile-page/wallet-page/wallet-page.component';
import { RegisterComponent } from './auth/register/register.component';
import {UserNotFoundComponent} from './shared/components/user-not-found/user-not-found.component';

const routes: Routes = [
  { path: 'ride', loadChildren: () => RideRoutingModule },
  { path: 'register', component: RegisterComponent },
  { path: 'two-factor', component: TwoFaComponent },
  { path: 'wallet', component: WalletPageComponent },
  { path: 'user-not-found', component: UserNotFoundComponent },
  { path: ':username', component: ProfilePageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
