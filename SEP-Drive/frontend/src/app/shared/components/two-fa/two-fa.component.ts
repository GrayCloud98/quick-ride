import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-two-fa',
  standalone: false,
  templateUrl: './two-fa.component.html',
  styleUrls: ['./two-fa.component.scss']
})
export class TwoFaComponent {
  verificationCode: string = '';
  errorMessage: string = '';
  username: string;

  constructor(
    private dialogRef: MatDialogRef<TwoFaComponent>,
    private authService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.username = data.username;
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  verifyCode() {
    if(this.verificationCode.length !== 6) {
      this.errorMessage = "Invalid code length. Please try again.";
      return;
    }

    const username = this.username;

    if (!username) {
      this.errorMessage = "User not found. Please log in again.";
      return;
    }

    this.authService.verifyCode(username, this.verificationCode).subscribe({
      next: (response) => {
        console.log('✅ Verification successful:', response);

        if (response.token != null) {
          localStorage.setItem('authToken', response.token);
        }
        this.authService.getUserInfo(username).subscribe({
          next: (user) => {
            console.log("✅ User Info Fetched:", user);
            localStorage.setItem('username', username);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authService.storeUserData(user);
            this.dialogRef.close();
            window.location.href = "/";
          },
          error: (err) => {
            console.error("❌ Failed to fetch user info:", err.message);
          }
        });
      },
      error: (err) => {
        console.error('❌ Verification failed:', err);
        this.errorMessage = 'Invalid code. Please try again.';
      }
    });
  }

}
