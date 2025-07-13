import { Component, ViewEncapsulation } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {UsersService} from '../services/users.service';
import { VehicleClass } from '../Constants/VehicleClassEnum';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = '';
  password: string = '';
  birthDate: Date | null = null;
  profilePicture : File | null = null;
  profilePictureName: string = '';
  vehicleClass: VehicleClass | null = null;
  RoleControl = new FormControl('');
  CarControl = new FormControl({ value: '', disabled: true });
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  hidePassword = true;
  constructor(private usersService: UsersService
  , private router: Router) {
    this.RoleControl.valueChanges.subscribe(role => {
      if (role === 'Driver') {
        this.CarControl.enable();
        this.CarControl.setValidators([Validators.required]);
      } else {
        this.CarControl.disable();
        this.CarControl.clearValidators();
        this.vehicleClass = null;
      }
      this.CarControl.updateValueAndValidity();
    });
  }
  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type.toLowerCase();


      if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
        this.profilePicture = file;
        this.profilePictureName = file.name;
        this.alertMessage = '';
      } else {
        this.showAlert('Only JPEG/JPG files are allowed.', 'error');
        this.removeFile();
      }
    }
  }

  removeFile(): void {
    this.profilePicture = null;
    this.profilePictureName = '';
  }
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onRegister(): void {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('firstName', this.firstName);
    formData.append('lastName', this.lastName);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('role', this.role);
    if (this.birthDate) {
      const formattedDate = this.formatDate(this.birthDate);
      formData.append('birthDate', formattedDate);
    }
    if (this.vehicleClass) {
      formData.append('vehicleClass', this.vehicleClass);
    }
    if(!this.role ){
      this.showAlert('Please select a role.', 'error');
      return;
    }
    if (this.role === 'Driver' && !this.vehicleClass) {
      this.showAlert('Please select a vehicle class.', 'error');
      return;
    }
    if (!this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.showAlert('Please enter a valid email address.', 'error');
      return;
    }
    if (this.profilePicture) {
      formData.append('profilePicture', this.profilePicture);
    }

    this.usersService.createUser(formData).subscribe({
      next: (response: any) => {
        this.showAlert(response.message || 'Registration successful', 'success');
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err: any) => {
        const msg = err.error?.message || err.error || 'The Email or Username is already in used.';
        this.showAlert(`Registration failed: ${msg}`, 'error');
      }
    });
  }
  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = null;
    }, 3000);
  }
}
