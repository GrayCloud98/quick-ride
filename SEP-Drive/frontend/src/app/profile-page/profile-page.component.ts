import { Component, OnInit } from '@angular/core';
import { ProfileService } from "../shared/services/profile.service";
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})

export class ProfilePageComponent implements OnInit {
  profileData: any = {};
  public isOwnProfile: any;

    constructor(
        private profileService: ProfileService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      const loggedInUser = this.authService.currentUserValue;

      if (username && loggedInUser && username === loggedInUser.username) {
        this.profileService.getCurrentUserProfile().subscribe({
          next: (data) => {
            this.profileData = data;
            this.isOwnProfile = true;
            if (this.profileData.profilePicture && !this.profileData.profilePicture.startsWith('http')) {
              this.profileData.profilePicture = `http://localhost:8080${this.profileData.profilePicture}`;
            }
          },
          error: (err) => {
            console.error('Error fetching own profile data:', err);
          }
        });
      } else if (username) {
        this.profileService.getUserByUsername(username).subscribe({
          next: (data) => {
            this.profileData = data;
            this.isOwnProfile = false;
            if (this.profileData.profilePicture && !this.profileData.profilePicture.startsWith('http')) {
              this.profileData.profilePicture = `http://localhost:8080${this.profileData.profilePicture}`;
            }
          },
          error: (err) => {
            if (err.status === 404) {
              this.router.navigate(['/user-not-found']);
            }
            console.error('Error fetching profile data:', err);
          }
        });
      }
    });
  }

  logout() {
    if (this.authService.clearUserData) {
      this.authService.clearUserData();
    } else {
      console.error("clearUserData not found in AuthService!");
    }
  }

  getFullStars(): number[] {
    const rating = Math.floor(this.profileData?.rating || 0);
    return Array(rating).fill(0);
  }

  hasHalfStar(): boolean {
    const rating = this.profileData?.rating || 0;
    return rating - Math.floor(rating) >= 0.5;
  }

}
