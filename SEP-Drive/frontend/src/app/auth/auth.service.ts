import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';
  private apiUrl2fa = 'http://localhost:8080/api/auth/verify';

  // BehaviourSubject to store the logged-in user
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user data is already in local storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  loginUser(username: string, password: string): Observable<any> {
    console.log("Sending login request with:", username, password);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      username: username,
      password: password
    };

    console.log("Headers:", headers);
    console.log("Request Body:", body);

    return this.http.post(this.apiUrl, body, {headers});
  }


  verifyCode(username: string, code: string): Observable<any> {
    console.log("Sending verification request with:", username, code);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = JSON.stringify({
      username: username,
      code: code,
    });

    console.log('Request Body:', body);

    // 🔍 Adding logs for errors
    return this.http.post(this.apiUrl2fa, body, { headers }).pipe(
      map((response) => {
        console.log("🌐 Full Response from Backend:", response);
        if(response) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
          console.log("User data stored in local storage:", response);
        } else {
          console.warn("Response is undefined or null");
        }
        return response;
      }),
      catchError((error) => {
        console.error("❌ Error during 2FA verification:", error.message);
        return [];
      })
    );
  }

  //Method to Store User Data
  storeUserData(userData: any) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData); // Update BehaviorSubject
  }

  //Method to Clear User Data (Logout)
  clearUserData() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    window.location.href = '/';
  }

  getUserInfo(username: string): Observable<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error("❌ No auth token found. Cannot fetch user info.");
      // @ts-ignore
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const apiUrl = `http://localhost:8080/api/users/${username}`;

    console.log("🚀 Fetching user info from backend with headers:", headers);

    return this.http.get(apiUrl, { headers }).pipe(
      map((response) => {
        console.log("✅ User info received from backend:", response);
        return response;
      }),
      catchError((error) => {
        console.error("❌ Failed to fetch user info:", error.message);
        throw error;
      })
    );
  }

  public isCustomer(username: string): Observable<boolean>{
    return this.http.get<boolean>(`http://localhost:8080/api/ride-requests/${username}/is-customer`);
}

}
