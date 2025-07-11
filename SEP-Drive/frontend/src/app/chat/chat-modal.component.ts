import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-modal',
  standalone: false,
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss']
})

export class ChatModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      chatId: string;
      username: string;
      recipient: string;
    },
    public dialogRef: MatDialogRef<ChatModalComponent>
  ) {}
}
