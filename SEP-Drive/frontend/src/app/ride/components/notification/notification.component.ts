import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  constructor(
    private snackBar: MatSnackBar,
    private wsService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const username = 'sac';

    this.wsService.subscribe(username);

    this.wsService.setCustomerCallback((message) => {
      const isOfferNotification = message.message === "A driver wants to take your ride!";

      const snackBarRef = this.snackBar.open(
        message.message,
        isOfferNotification ? 'View Offer' : 'Close',
        { duration: 8000 }
      );

      if (isOfferNotification) {
        snackBarRef.onAction().subscribe(() => {
          this.router.navigate(['/ride/offer']);
        });
      }
    });

    this.wsService.setDriverCallback((message) => {
      this.snackBar.open(message.message, 'Close', { duration: 8000 });
    });
  }
}

