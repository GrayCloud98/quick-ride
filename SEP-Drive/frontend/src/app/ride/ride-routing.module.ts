import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RidePageComponent} from './pages/ride-page/ride-page.component';
import {ActiveRidePageComponent} from './pages/active-ride-page/active-ride-page.component';

const routes: Routes = [
  {path: "request", component: RidePageComponent},
  {path: "active", component: ActiveRidePageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RideRoutingModule {
}
