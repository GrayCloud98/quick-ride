import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const username = this.authService.currentUserValue?.username;
    if (!username) return;

    this.subscribeToNotifications(username);
    this.registerCustomerNotificationHandler();
    this.registerDriverNotificationHandler();
  }

  private subscribeToNotifications(username: string) {
    this.notificationService.subscribe(username);
  }

  private registerCustomerNotificationHandler() {
    this.notificationService.setCustomerCallback((message) => {
      let action = 'Close';
      let route: string | null = null;

      if (message.message === 'You received an Offer for your Request!') {
        action = 'View Offer';
        route = '/ride/offer';
      }

      const snackBarRef = this.snackBar.open(message.message, action, { duration: 8000 });

      if (route)
        snackBarRef.onAction().subscribe( () => void this.router.navigate([route]) );
    });
  }

  private registerDriverNotificationHandler() {
    this.notificationService.setDriverCallback((message) => {
      let action = 'Close';
      let route: string | null = null;

      switch (message.type) {
        case 'acceptance':
          action = 'View Simulation';
          route = '/simulation';
          break;
        case 'rejection':
          action = 'View Requests';
          route = '/ride/available';
          break;
      }

      const snackBarRef = this.snackBar.open(message.message, action, { duration: 8000 });

      if (route)
        snackBarRef.onAction().subscribe( () => void this.router.navigate([route]) );
    });
  }
}
