import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

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
  constructor(public dialogRef: MatDialogRef<RideRatingDialogComponent>) {}

  setRating(value: number): void {
  this.rating = value;
  }
  submit(): void {
    this.dialogRef.close({
      rating: this.rating,
      feedback: this.feedback
    });
  }
}
