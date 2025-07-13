import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LoginDialogComponent} from '../login-dialog/login-dialog.component';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {RideRequestService} from '../../../ride/services/ride-request.service';
import {RidehistoryComponent} from '../ridehistory/ridehistory.component';
import {SimulationService} from '../../../simulation/simulation.service';
import {StatisticsComponent} from '../statistics/statistics.component';
import { WalletService } from '../../services/wallet.service';
import {LeaderboardComponent} from '../../../leaderboard/leaderboard.component';
@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  isLoggedIn: boolean = false;
  username: string = '';
  photoUrl: string = '';
  usernameControl = new FormControl();
  options: string[] = [];
  filteredOptions!: Observable<string[]>;
  walletBalance: number | null = null;

  constructor(
    private readonly dialogue: MatDialog,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly rideService: RideRequestService,
    private readonly simService: SimulationService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.loadBalance();
  }

  loadBalance() {
    this.walletService.updateBalance();
    this.walletService.balance$.subscribe({
      next: balance => this.walletBalance = balance/100
    })

    this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.isLoggedIn = true;
        this.username = user.username ? user.username : 'No username';

        if (user && user.photoUrl) {
          if (!user.photoUrl.startsWith('http')) {
            this.photoUrl = `http://localhost:8080${user.photoUrl}`;
          } else {
            this.photoUrl = user.photoUrl;
          }
        } else {
          this.photoUrl = 'assets/placeholder.png';
        }
      } else {
        this.isLoggedIn = false;
        this.username = '';
        this.photoUrl = '';
      }
    });

    this.authService.photoUrl$.subscribe((newUrl) => {
      this.photoUrl = newUrl;
    });

    this.applyRideRequestButtonDisplayLogic();
  }

  openLoginDialog() {
    const dialogRef = this.dialogue.open(LoginDialogComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  searchUser(username: string) {
    if (username && username.trim().length > 0) {
      console.log('searching for user:', username);
      this.router.navigate([`/${username}`]).then(() => {
        this.usernameControl.reset();
      });
    }
  }

  goToProfile() {
    this.router.navigate([`/${(this.username)}`]);
  }
  goToWalletpage() {
    this.router.navigate([`/wallet`]);
  }
  goToridehistory(){
    this.router.navigate([`/history`])
  }
  goToStatistics(){
    this.router.navigate([`/statistics`])
  }
 goToLeaderboard(){
    this.router.navigate([`/leaderboard`])
  }

  goHome() {
    this.router.navigate(['/']);
  }


  userHasActiveRide: boolean = false;
  userHasActiveSimulation: boolean = false;
  isCustomer: boolean = false;

  private applyRideRequestButtonDisplayLogic(){
    this.authService.isCustomer().subscribe({
      next: isCustomer => this.isCustomer = isCustomer
    })

    this.rideService.updateActiveRideStatus();
    this.rideService.activeRideStatus$.subscribe({
      next: status => this.userHasActiveRide = status
    });


    this.simService.updateActiveSimulationStatus();
    this.simService.activeSimulationStatus$.subscribe({
      next: status => this.userHasActiveSimulation = status
    })
  }
}
