import { Component, OnInit } from '@angular/core';
import { LeaderboardService, DriverBoard } from './leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: false,
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']  // <-- Note: 'styleUrls' not 'styleUrl'
})
export class LeaderboardComponent implements OnInit {

  leaderboard: DriverBoard[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.leaderboardService.getLeaderboard().subscribe((data: DriverBoard[]) => {
      this.leaderboard = data;
    });
  }

  sortByFullName(): void {
      this.leaderboard.sort((a, b) => {
        const nameA = a.fullName.toLowerCase();
        const nameB = b.fullName.toLowerCase();

        if (nameA < nameB) return this.sortDirection === 'asc' ? -1 : 1;
        if (nameA > nameB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
}
