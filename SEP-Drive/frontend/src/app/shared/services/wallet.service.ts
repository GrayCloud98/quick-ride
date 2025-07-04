import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

export interface Transaction {
  id: number;
  amountCents: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:8080/api/wallet';

  constructor(private http: HttpClient) { }

  getBalance(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/balance`);
  }

  deposit(amountCents: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/deposit`, null, {
      params: { amountCents: amountCents.toString() }
    });
  }

  transfer(toUserId: number, amountCents: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transfer`, null, {
      params: {
        toUserId: toUserId.toString(),
        amountCents: amountCents.toString()
      }
    });
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  private balance = new BehaviorSubject<number>(0);
  public balance$ = this.balance.asObservable();

  updateBalance(): void {
    this.getBalance().subscribe({
      next: balance => this.balance.next(balance),
    });
  }
}
