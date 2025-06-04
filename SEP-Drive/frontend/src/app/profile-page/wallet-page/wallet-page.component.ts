import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService, Transaction } from '../../shared/services/wallet.service';

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

  constructor(
    private router: Router,
    private walletService: WalletService,
  ) { }

  ngOnInit() {
    this.loadBalance();
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
        this.balance = balanceCents / 100;
      },
      error: () => {
        this.error = 'Balance could not be loaded!';
      }
    });
  }

  topUp() {
    if (this.selectedAmount && this.selectedAmount > 0) {
      this.walletService.deposit(this.selectedAmount * 100).subscribe({
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
    this.router.navigate(['/']);
  }
}
