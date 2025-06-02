import { NgModule } from '@angular/core';
import {TwoFaComponent} from  './shared/components/two-fa/two-fa.component';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { RideRoutingModule } from './ride/ride-routing.module';
import {RegisterComponent} from './auth/register/register.component';
import { RideSimulationComponent } from './ride-simulation/ride-simulation.component';
const routes: Routes = [
  { path: 'ride', loadChildren: () => RideRoutingModule },
  { path: 'register', component: RegisterComponent },
  { path: 'two-factor', component: TwoFaComponent },
  { path: 'simulation', component: RideSimulationComponent },
  { path: ':username', component: ProfilePageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
