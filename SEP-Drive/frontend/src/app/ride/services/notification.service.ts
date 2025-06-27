import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {AuthService} from '../../auth/auth.service';
import {RideRequestService} from './ride-request.service';
import {SimulationService} from '../../simulation/simulation.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private client: Client;
  private callback?: (msg: any) => void;

  constructor(
    private authService: AuthService,
    private rideService: RideRequestService,
    private simService: SimulationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this.client.onConnect = () => {
      if(!this.authService.currentUserValue) return;

      const username = this.authService.currentUserValue.username;
      const role = this.authService.currentUserValue.role.toLowerCase();

      this.setCallback(role);

      this.client.subscribe(
        `/topic/${role}/${username}`,
        (message: IMessage) =>  this.callback?.( JSON.parse(message.body) )
      );
    }

    this.client.activate();
  }

  private setCallback(role: string) {
    if(role === 'customer') {
      this.callback = (message: any) => {
        let action = 'Close';
        let route: string | null = null;

        if (message.message === 'You received an Offer for your Request!') {
          action = 'View Offer';
          route = '/ride/offer';
        }

        const snackBarRef = this.snackBar.open(message.message, action, { duration: 8000 });

        if (route)
          snackBarRef.onAction().subscribe( () => void this.router.navigate([route]) );
      }
    }

    else if (role === 'driver') {
      this.callback = (message: any) => {
        let action = 'Close';
        let route: string | null = null;

        switch (message.type) {
          case 'acceptance':
            this.rideService.updateActiveRideStatus();
            this.simService.updateActiveSimulationStatus();
            void this.router.navigate(['/simulation']);
            break;
          case 'rejection':
            action = 'View Requests';
            route = '/ride/available';
            break;
        }

        const snackBarRef = this.snackBar.open(message.message, action, { duration: 8000 });

        if (route)
          snackBarRef.onAction().subscribe( () => void this.router.navigate([route]) );
      }
    }
  }
}
