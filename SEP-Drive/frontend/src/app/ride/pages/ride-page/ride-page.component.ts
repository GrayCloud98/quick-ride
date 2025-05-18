import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-ride-page',
  standalone: false,
  templateUrl: './ride-page.component.html',
  styleUrl: './ride-page.component.scss'
})
export class RidePageComponent implements OnInit {
  username: string = '';
  accessAllowed: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe({
      next: user => {
        if (user) {
          if (!user.username) return;
          this.username = user.username;
          this.authService.isCustomer(this.username).subscribe({
            next: isCustomer => this.accessAllowed = isCustomer,
            error: err => console.log(err),
          });
        }
      },
      error: err => console.log(err)
    });
  }
}
