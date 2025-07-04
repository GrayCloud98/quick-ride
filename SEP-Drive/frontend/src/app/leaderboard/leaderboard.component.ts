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
  currentSortColumn: keyof DriverBoard | '' = '';

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.leaderboardService.getLeaderboard().subscribe((data: DriverBoard[]) => {
      this.leaderboard = data;
    });
  }

  sortBy(column: keyof DriverBoard): void {
    if (this.currentSortColumn === column) {
      // Toggle direction if the same column is clicked again
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortDirection = 'asc';
      this.currentSortColumn = column;
    }

    this.leaderboard.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      // Convert to lowercase if strings (for case-insensitive sorting)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
