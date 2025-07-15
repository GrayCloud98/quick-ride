import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TwoFaComponent } from '../two-fa/two-fa.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-login-dialog',
  standalone: false,
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoginDialogComponent {
  username = '';
  password = '';
  hidePassword = true;
  errorMessage: any;

  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private dialog: MatDialog
  ) {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = "Please enter a username and password.";
      return;
    }
    this.authService.loginUser(this.username, this.password).subscribe({
      next: (response) => {
        console.log("Login successful:", response);
        localStorage.setItem('username', this.username);
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.dialogRef.close();
        window.location.href = '/';
      },
      error: (err) => {
        console.error("Backend Error Response:", err);

        if (err.status === 401 && err.error.includes("Email verification required")) {
          console.log("🔒 2FA Required. Opening Dialog...");
          this.dialogRef.close();
          this.open2FADialog();
        } else if (err.status === 401) {
          this.errorMessage = "Login failed. Incorrect username or password. Please try again.";
        } else {
          this.open2FADialog();
        }
      }
    });
  }

  open2FADialog() {
    console.log("Opening 2FA dialog...");
    const dialogRef = this.dialog.open(TwoFaComponent, {
      width: '400px',
      data: { username: this.username }
    });

    dialogRef.afterClosed().subscribe(code => {
      if (code) {
        console.log('2FA Code entered:', code);

        this.authService.verifyCode(this.username, code).subscribe({
          next: (response) => {
            console.log("✅ 2FA Verification successful:", response);
            console.log("🔍 Storing to localStorage:", JSON.stringify(response));
            localStorage.setItem('currentUser', JSON.stringify(response));
            console.log("🔍 Local Storage Value Now:", localStorage.getItem('currentUser'));
            this.dialogRef.close();
            window.location.href = '/';
          },
          error: (err) => {
            console.error("2FA Verification failed:", err);
          }
        });
      }
    });
  }

}

