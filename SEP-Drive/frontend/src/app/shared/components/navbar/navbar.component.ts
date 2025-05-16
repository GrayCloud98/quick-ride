import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LoginDialogComponent} from '../login-dialog/login-dialog.component';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {RideRequestService} from '../../../ride/services/ride-request.service';
import {log} from '@angular-devkit/build-angular/src/builders/ssr-dev-server';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  activeRide: boolean = false;
  isLoggedIn: boolean = false;
  username: string = '';
  photoUrl: string = '';
  usernameControl = new FormControl();
  isCustomer: boolean = false;
  options: string[] = [];
  filteredOptions!: Observable<string[]>;

  constructor(
    private readonly dialogue: MatDialog,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly rideService: RideRequestService
  ) {
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.isLoggedIn = true;
        this.username = user.username ? user.username : 'No username';
        this.photoUrl = user.photoUrl ? user.photoUrl : 'assets/placeholder.png';
      } else {
        this.isLoggedIn = false;
        this.username = '';
        this.photoUrl = '';
      }
    });

    this.authService.isCustomer(this.username).subscribe({
      next: isCustomer => this.isCustomer = isCustomer,
      error: err => console.log(err)
    })

    this.rideService.updateActiveRideStatus(this.username);
    this.rideService.activeRideStatus$.subscribe({
      next: (status: boolean) => {
        this.activeRide = status;
      }
    });
  }

  openLoginDialog() {
    const dialogRef = this.dialogue.open(LoginDialogComponent, {
      width: '400px',
      height: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  searchUser(username: string) {
    console.log('searching for user:', username);
    if (username && username.trim().length > 0) {
      console.log('searching for user:', username);
      this.router.navigate([`/${username}`]).then(() => {
        this.usernameControl.reset();
      });
    }
  }

  goToProfile() {
    console.log('going to profile');
    this.router.navigate([`/${(this.username)}`]);
  }

  goHome() {
    console.log('going home');
    this.router.navigate(['/']);
  }

  routeToRideRequest() {
    this.router.navigate([`/ride/request`]);
  }

  routeToActiveRide() {
    this.router.navigate([`/ride/active`]);
  }
}
