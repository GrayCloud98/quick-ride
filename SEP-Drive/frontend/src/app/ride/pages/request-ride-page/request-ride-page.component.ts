import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {SimulationService} from '../../../simulation/simulation.service';

@Component({
  selector: 'app-request-ride-page',
  standalone: false,
  templateUrl: './request-ride-page.component.html',
  styleUrl: './request-ride-page.component.scss'
})
export class RequestRidePageComponent implements OnInit {
  accessAllowed: boolean = false;
  userHasActiveSimulation: boolean = false;
  constructor(private authService: AuthService,
              private simService: SimulationService) {}

  ngOnInit() {
    if(this.authService.currentUserValue) {
      this.accessAllowed = this.authService.currentUserValue.role === 'Customer'
      this.simService.activeSimulationStatus$.subscribe({
        next: userHasActiveSimulation => this.userHasActiveSimulation = userHasActiveSimulation
      })
    }
  }
}
