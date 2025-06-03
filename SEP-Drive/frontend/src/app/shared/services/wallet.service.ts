import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Transaction {
  id: number;
  amountCents: number;
  date: string; // z. B. '2024-06-02T14:03:21'
}
@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private apiUrl = 'http://localhost:8080/api/wallet';

  constructor(private http: HttpClient) { }

  getBalance(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/balance`, {
      headers: { 'X-User-Id': userId.toString() }
    });
  }

  deposit(userId: number, amountCents: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/deposit`, null, {
      headers: { 'X-User-Id': userId.toString() },
      params: { amountCents: amountCents.toString() }
    });
  }

  transfer(fromUserId: number, toUserId: number, amountCents: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transfer`, null, {
      headers: { 'X-User-Id': fromUserId.toString() },
      params: {
        toUserId: toUserId.toString(),
        amountCents: amountCents.toString()
      }
    });
  }
  getTransactions(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, {
      headers: { 'X-User-Id': userId.toString() }
    });
  }

}
