import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  constructor(
    private snackBar: MatSnackBar,
    private wsService: NotificationService,
  ) {}

  ngOnInit(): void {
    const username = 'sad';

    this.wsService.subscribe(username);

    this.wsService.setCustomerCallback((message) => {
      const text = message.message
        ?? `${message.driverName ?? 'A driver'} made you an offer!`;
      this.snackBar.open(text, 'Close', { duration: 5000 });
    });

    this.wsService.setDriverCallback((message) => {
      const text = message.message
        ?? `Your offer was ${message.status?.toLowerCase() ?? 'updated'} by the customer.`;
      this.snackBar.open(text, 'Close', { duration: 5000 });
    });
  }
}
