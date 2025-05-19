import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RequestRidePageComponent} from './pages/request-ride-page/request-ride-page.component';
import {ActiveRidePageComponent} from './pages/active-ride-page/active-ride-page.component';

const routes: Routes = [
  {path: "request", component: RequestRidePageComponent},
  {path: "active", component: ActiveRidePageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RideRoutingModule {
}
