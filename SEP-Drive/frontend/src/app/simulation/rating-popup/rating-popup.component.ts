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

  onSubmit() {
    this.dialogRef.close('submitted'); // add a result here
  }
}
