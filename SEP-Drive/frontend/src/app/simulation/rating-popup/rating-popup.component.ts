import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {SimulationService} from '../simulation.service';
import {AuthService} from '../../auth/auth.service';
import {RideRequestService} from '../../ride/services/ride-request.service';
import {WalletService} from '../../shared/services/wallet.service';

@Component({
  selector: 'rating-popup',
  standalone: false,
  templateUrl: './rating-popup.component.html',
  styleUrl: './rating-popup.component.scss'
})
export class RatingPopupComponent implements OnInit {
  constructor(private authService: AuthService,
              private rideService: RideRequestService,
              private simService: SimulationService,
              private walletService: WalletService,
              private dialogRef: MatDialogRef<RatingPopupComponent>) {}

  partner!: string;
  stars = Array(5).fill(0);
  rating = 0;
  hoverRating = 0;

  ngOnInit(){
    this.authService.isCustomer().subscribe({
      next: isCustomer => isCustomer ? this.partner = 'Driver' : this.partner = 'Customer'
    })
  }

  onMouseEnter(index: number) {
    this.hoverRating = index;
  }

  onMouseLeave() {
    this.hoverRating = 0;
  }

  onStarClick(index: number) {
    this.rating = index;
  }

  onSubmit() {
    this.simService.rate(this.rating).subscribe({
      next: () => {
        this.dialogRef.close(this.rating)
        this.rideService.updateActiveRideStatus();
        this.simService.updateActiveSimulationStatus();
        this.walletService.updateBalance();
      },
      error: err => console.error('Rating failed:', err)
    });
  }
}
