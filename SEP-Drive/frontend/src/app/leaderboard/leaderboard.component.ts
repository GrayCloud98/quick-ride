import { Component, OnInit } from '@angular/core';
import { LeaderboardService, DriverBoard } from './leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: false,
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  leaderboard: DriverBoard[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';
  currentSortColumn: keyof DriverBoard | '' = '';
  searchTerm: string = '';

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.leaderboardService.getLeaderboard().subscribe((data: DriverBoard[]) => {
      this.leaderboard = data;
    });
  }

  get filteredLeaderboard(): DriverBoard[] {
    const term = this.searchTerm.toLowerCase();
    return this.leaderboard.filter(driver =>
      driver.username.toLowerCase().startsWith(term) ||
      driver.fullName.toLowerCase().startsWith(term)
    );
  }

  sortBy(column: keyof DriverBoard): void {
    if (this.currentSortColumn === column) {

      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortDirection = 'asc';
      this.currentSortColumn = column;
    }

    this.leaderboard.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];


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
