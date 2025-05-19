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
      if (username) {
        this.profileService.getAllProfiles().subscribe({
          next: (data: any[]) => {
            this.profileData = data.find(user => user.username === username);

            if (this.profileData) {
              if (this.profileData.profilePicture && !this.profileData.profilePicture.startsWith('http')) {
                this.profileData.profilePicture = `http://localhost:8080${this.profileData.profilePicture}`;
              }
              // Check if this is the currently logged-in user's profile
              const loggedInUser = this.authService.currentUserValue;
              this.isOwnProfile = loggedInUser && loggedInUser.username === username;
            } else {
              console.warn('User not found!');
            }
          },
          error: (err) => {
            console.error('Error fetching profile data:', err);
          },
          complete: () => {
            console.log('Data fetch complete');
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

}
