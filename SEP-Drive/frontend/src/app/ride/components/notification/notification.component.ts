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
      const isOffer = message.message === 'A driver wants to take your ride!';
      const action = isOffer ? 'View Offer' : 'Close';

      const snackBarRef = this.snackBar.open(message.message, action, { duration: 8000 });

      if (isOffer) {
        snackBarRef.onAction().subscribe(() => {
          void this.router.navigate(['/ride/offer']);
        });
      }
    });
  }

  private registerDriverNotificationHandler() {
    this.notificationService.setDriverCallback((message) => {
      this.snackBar.open(message.message, 'Close', { duration: 8000 });
    });
  }
}
