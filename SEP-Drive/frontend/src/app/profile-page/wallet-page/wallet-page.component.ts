import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService, Transaction } from '../../shared/services/wallet.service';
import { AuthService } from '../../auth/auth.service';
import { Location} from '@angular/common';

@Component({
  selector: 'app-wallet-page',
  standalone: false,
  templateUrl: './wallet-page.component.html',
  styleUrls: ['./wallet-page.component.scss']
})
export class WalletPageComponent implements OnInit {
  balance: number = 0;
  selectedAmount: number | null = null;
  error: string = '';
  success: string = '';
  transactions: Transaction[] = [];
  showHistory = false;
  accessAllowed: boolean = false;

  constructor(
    private router: Router,
    private walletService: WalletService,
    private authService: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    this.loadBalance();
    this.authService.isCustomer().subscribe({
      next: isCustomer => this.accessAllowed = isCustomer,
      error: err => console.log(err),
    });
  }

  loadTransactions() {
    this.walletService.getTransactions().subscribe({
      next: (data) => this.transactions = data,
      error: () => this.transactions = []
    });
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.transactions.length === 0) {
      this.loadTransactions();
    }
  }

  loadBalance() {
    this.walletService.getBalance().subscribe({
      next: (balanceCents) => {
        const newBalance = balanceCents / 100;
        this.animateBalanceChange(this.balance, newBalance);
      },
      error: () => {
        this.error = 'Balance could not be loaded!';
      }
    });
  }

  animateBalanceChange(start: number, end: number) {
    const duration = 700;
    const steps = 25;
    let currentStep = 0;
    const diff = end - start;

    const interval = setInterval(() => {
      currentStep++;
      this.balance = parseFloat((start + (diff * currentStep) / steps).toFixed(2));
      if (currentStep >= steps) {
        clearInterval(interval);
        this.balance = parseFloat(end.toFixed(2));
      }
    }, duration / steps);
  }

  topUp() {
    if (this.selectedAmount && this.selectedAmount > 0) {
      this.success = '';
      this.error = '';

      if (this.selectedAmount > 10000) {
        this.error = 'Maximum allowed amount is 10,000 €';
        return;
      }

      this.walletService.deposit(this.selectedAmount * 100).subscribe({
        next: () => {
          this.success = `${this.selectedAmount} € were successfully charged!`;
          this.selectedAmount = null;
          this.loadBalance();
          this.walletService.updateBalance();
        },
        error: () => {
          this.error = 'Charging failed.';
        }
      });
    }
  }

  goToProfile() {
    this.location.back();
  }
}
