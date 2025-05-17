import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TwoFaComponent } from '../two-fa/two-fa.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-login-dialog',
  standalone: false,
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss'
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

        // 📝 Step 1: Store User Data in Local Storage
        localStorage.setItem('currentUser', JSON.stringify(response));

        // 📝 Step 2: Close the dialog
        this.dialogRef.close();

        // 📝 Step 3: Navigate to the home page or dashboard
        window.location.href = '/';  // You can change this to router navigation if needed
      },
      error: (err) => {
        console.error("Backend Error Response:", err);

        // 🔒 2FA Required
        if (err.status === 401 && err.error.includes("Email verification required")) {
          console.log("🔒 2FA Required. Opening Dialog...");
          this.dialogRef.close();
          this.open2FADialog();
        } else if (err.status === 500 && err.error === 'Failed to send verification email.') {
          this.errorMessage = "Unable to send verification email. Please try again later.";
        } else {
          this.errorMessage = "Login failed. Incorrect username or password. Please try again.";
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

        // Send the code to the backend
        this.authService.verifyCode(this.username, code).subscribe({
          next: (response) => {
            console.log("✅ 2FA Verification successful:", response);

            // 🔍 Add this line to check what we are storing
            console.log("🔍 Storing to localStorage:", JSON.stringify(response));

            // 📝 Step 1: Store user data in Local Storage
            localStorage.setItem('currentUser', JSON.stringify(response));

            // 🔍 Check if it is actually stored
            console.log("🔍 Local Storage Value Now:", localStorage.getItem('currentUser'));

            // 📝 Step 2: Close the dialog
            this.dialogRef.close();

            // 📝 Step 3: Navigate to the main page
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

