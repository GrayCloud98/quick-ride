import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService,Transaction } from '../../shared/services/wallet.service';
import {AuthService} from '../../auth/auth.service'

@Component({
  selector: 'app-wallet-page',
  standalone: false,
  templateUrl: './wallet-page.component.html',
  styleUrls: ['./wallet-page.component.scss']
})
export class WalletPageComponent implements OnInit {
  balance: number = 0;
  selectedAmount: number | null = null;
  userId: number = 0;
  error: string = '';
  success: string = '';
  transactions: Transaction[] = [];
  showHistory = false;
  role :string='';

  constructor(
    private router: Router,
    private walletService: WalletService,
  ) { }

  ngOnInit() {
    this.loadBalance();
  }
  loadTransactions() {
    this.walletService.getTransactions(this.userId).subscribe({
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
    if (this.userId) {
      this.walletService.getBalance(this.userId).subscribe({
      next: (balanceCents) => {
        this.balance = balanceCents / 100; // Backend liefert Cents, wir zeigen Euro!
      },
        error: (err) => {
          console.error('Error during operation:', err);
          this.error = 'Balance could not be loaded!';
        }
    });} else {
      this.error = 'User ID is invalid!';
    }
  }

  topUp() {
    if (this.role !== 'customer') {
      return;
    }
    if (this.selectedAmount && this.selectedAmount > 0) {
      this.walletService.deposit(this.userId, this.selectedAmount * 100).subscribe({
        next: () => {
          this.success = `${this.selectedAmount} € were successfully charged!`;
          this.selectedAmount = null;
          this.loadBalance();
        },
        error: () => {
          this.error = 'Charging failed.';
        }
      });
    }
  }

  goToProfile() {
    this.router.navigate(['/']); // Passe ggf. den Pfad an!
  }
}

