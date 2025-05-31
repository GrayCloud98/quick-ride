import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RequestRidePageComponent} from './pages/request-ride-page/request-ride-page.component';
import {ActiveRidePageComponent} from './pages/active-ride-page/active-ride-page.component';
//***
import {AvailableRidesPageComponent} from './pages/available-rides-page/available-rides-page.component';

const routes: Routes = [
  {path: "request", component: RequestRidePageComponent},
  {path: "active", component: ActiveRidePageComponent},
  //***
  {path: "available", component: AvailableRidesPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RideRoutingModule {
}
