import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'rating-popup',
  standalone: false,
  templateUrl: './rating-popup.component.html',
  styleUrl: './rating-popup.component.scss'
})
export class RatingPopupComponent {
  constructor(private dialogRef: MatDialogRef<RatingPopupComponent>) {}

  stars = Array(5).fill(0);
  rating = 0;
  hoverRating = 0;

  onMouseEnter(index: number) {
    this.hoverRating = index;
  }

  onMouseLeave() {
    this.hoverRating = 0;
  }

  onStarClick(index: number) {
    this.rating = index;
  }

  onSubmit() {
    this.dialogRef.close(this.rating);
  }
}
