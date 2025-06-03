import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'http://localhost:8080/api/users/';

  constructor(private http: HttpClient) {}

  getAllProfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'user');
  }

  getCurrentUserProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'me');
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${username}`);
  }
}
