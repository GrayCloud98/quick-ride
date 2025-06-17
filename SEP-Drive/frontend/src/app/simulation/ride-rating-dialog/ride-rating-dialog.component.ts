import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {SimulationService} from '../simulation.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-ride-rating-dialog',
  standalone: false,
  templateUrl: './ride-rating-dialog.component.html',
  styleUrl: './ride-rating-dialog.component.scss'
})
export class RideRatingDialogComponent {
  rating = 0;
  hoverRating = 0;
  feedback = '';
  id: number | null = null;

  constructor(public dialogRef: MatDialogRef<RideRatingDialogComponent>,
              private simulationService:  SimulationService,
              private router: Router) { }

  setRating(value: number): void {
  this.rating = value;
  }
  submit(): void {
    this.dialogRef.close({
      rating: this.rating,
      feedback: this.feedback
    });

    this.simulationService.rating(this.rating).subscribe({});
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
