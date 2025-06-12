import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface UserResponse {
  username: string;
  email: string;
  role: string;
  photoUrl?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';
  private apiUrl2fa = 'http://localhost:8080/api/auth/verify';

  // BehaviorSubjects for user data and photo URL
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private photoUrlSubject = new BehaviorSubject<string>('assets/placeholder.png');
  public photoUrl$ = this.photoUrlSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.currentUserSubject.next(parsedUser);
      const resolvedPath = this.resolveImagePath(parsedUser.profilePicture);
      this.updatePhotoUrl(resolvedPath);
    }
  }

  loginUser(username: string, password: string): Observable<UserResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username, password };

    return this.http.post<UserResponse>(this.apiUrl, body, { headers }).pipe(
      map((response: UserResponse) => {
        if (response && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('authToken', response.token);
          this.currentUserSubject.next(response);
          const resolvedPath = this.resolveImagePath(response.photoUrl);
          this.updatePhotoUrl(resolvedPath);
        }
        return response;
      })
    );
  }

  verifyCode(username: string, code: string): Observable<UserResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = JSON.stringify({ username, code });

    return this.http.post<UserResponse>(this.apiUrl2fa, body, { headers }).pipe(
      map((response: UserResponse) => {
        if (response && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('authToken', response.token);
          this.currentUserSubject.next(response);
          const resolvedPath = this.resolveImagePath(response.photoUrl);
          this.updatePhotoUrl(resolvedPath);
        }
        return response;
      }),
      catchError((error) => {
        console.error("Error during 2FA verification:", error.message);
        return [];
      })
    );
  }

  storeUserData(userData: any) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  clearUserData() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.updatePhotoUrl('assets/placeholder.png');
    window.location.href = '/';
  }

  getUserInfo(username: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return new Observable();
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    const apiUrl = `http://localhost:8080/api/users/${username}`;
    return this.http.get(apiUrl, { headers }).pipe(
      map((response) => response),
      catchError((error) => {
        console.error("Failed to fetch user info:", error.message);
        throw error;
      })
    );
  }
  getRoleFromToken(): string {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role || decoded.roles?.[0] || '';
    } catch {
      return '';
    }
  }

  private resolveImagePath(imagePath: string | undefined): string {
    if (imagePath) {
      return imagePath.startsWith('http')
        ? imagePath
        : `http://localhost:8080${imagePath}`;
    }
    return 'assets/placeholder.png';
  }

  updatePhotoUrl(newUrl: string) {
    this.photoUrlSubject.next(newUrl ?? 'assets/placeholder.png');
  }

  public isCustomer(): Observable<boolean>{
    return this.http.get<boolean>(`http://localhost:8080/api/ride-requests/is-customer`);
  }

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

}
