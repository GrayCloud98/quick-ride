import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-request-ride-page',
  standalone: false,
  templateUrl: './request-ride-page.component.html',
  styleUrl: './request-ride-page.component.scss'
})
export class RequestRidePageComponent implements OnInit {
  username: string = '';
  accessAllowed: boolean = false;
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe({
      next: user => {
        if (user) {
          if (!user.username) return;
          this.username = user.username;
          this.authService.isCustomer().subscribe({
            next: isCustomer => this.accessAllowed = isCustomer,
            error: err => console.log(err),
          });
        }
      },
      error: err => console.log(err)
    });
  }
}
