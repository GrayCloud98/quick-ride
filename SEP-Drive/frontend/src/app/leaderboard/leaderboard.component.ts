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

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.leaderboardService.getLeaderboard().subscribe((data: DriverBoard[]) => {
      this.leaderboard = data;
    });
  }
}
