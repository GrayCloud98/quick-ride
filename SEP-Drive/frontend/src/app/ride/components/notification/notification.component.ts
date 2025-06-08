import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: false,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  constructor(
    private snackBar: MatSnackBar,
    private wsService: NotificationService
  ) {}

  ngOnInit(): void {
    this.wsService.setCustomerCallback((message) => {
      this.snackBar.open(
        `${message.driverName} made you an offer!`,
        'Close',
        { duration: 5000 }
      );
    });

    this.wsService.setDriverCallback((message) => {
      this.snackBar.open(
        `Your offer was ${message.status.toLowerCase()} by the customer.`,
        'Close',
        { duration: 5000 }
      );
    });
  }
}
