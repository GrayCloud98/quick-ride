import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Optional
} from '@angular/core';
import { ChatSocketService } from '../shared/services/chat-socket.service';
import { HttpClient } from '@angular/common/http';
import { Subscription, firstValueFrom } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chatId!: string;
  @Input() username!: string;
  @Input() recipient!: string;

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: any[] = [];
  newMessage = '';
  editingMessageId: number | null = null;
  showEmojiPicker = false;
  menuContext: any = null;

  private messageSub!: Subscription;

  constructor(
      private chatSocketService: ChatSocketService,
      private http: HttpClient,
      @Optional() private dialogRef: MatDialogRef<ChatComponent>
  ) {}

  async ngOnInit(): Promise<void> {
    this.chatSocketService.connect(this.username, this.recipient);
    (window as any).chatSocketService = this.chatSocketService;

    await firstValueFrom(this.chatSocketService.connected$);
    this.loadChatHistory();

    this.messageSub = this.chatSocketService.messages$.subscribe((msg: any) => {
      if (msg.action === 'delete' && msg.messageId) {
        const target = this.messages.find(m => m.id === msg.messageId);
        if (target) target.deleted = true;
        return;
      }

      msg.sender = msg.senderUsername;
      msg.read = Boolean(msg.read);

      const isRecipient =
          msg.recipientUsername?.toLowerCase() === this.username?.toLowerCase();
      if (isRecipient && !msg.read) {
        this.chatSocketService.markMessageAsRead(msg.id);
      }

      const existingIndex = this.messages.findIndex(m => m.id === msg.id);
      if (existingIndex !== -1) {
        this.messages[existingIndex] = {
          ...this.messages[existingIndex],
          ...msg
        };
      } else {
        this.messages.push(msg);
      }

      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.chatSocketService.disconnect();
    if (this.messageSub) this.messageSub.unsubscribe();
  }

  send(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    if (this.editingMessageId !== null) {
      this.chatSocketService.editMessage(
          { messageId: this.editingMessageId, newContent: trimmed },
          token
      );
      this.editingMessageId = null;
    } else {
      this.chatSocketService.sendMessage({
        chatId: this.chatId,
        senderUsername: this.username,
        recipientUsername: this.recipient,
        content: trimmed,
        timestamp: new Date().toISOString()
      });
    }

    this.newMessage = '';
    this.showEmojiPicker = false;
    this.menuContext = null;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.newMessage = '';
  }

  startEdit(msg: any): void {
    this.editingMessageId = msg.id;
    this.newMessage = msg.content;
    this.menuContext = null;
  }

  deleteMessage(msg: any): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    this.chatSocketService.deleteMessage(
        { messageId: msg.id, otherUsername: this.recipient },
        token
    );

    this.menuContext = null;
  }

  canEditOrDelete(msg: any): boolean {
    return msg.sender === this.username && !msg.read && !msg.deleted;
  }

  appendEmoji(emoji: string): void {
    this.newMessage += emoji;
  }

  private loadChatHistory(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[CHAT] No auth token found, skipping message load.');
      return;
    }

    this.http
        .get<any[]>(`http://localhost:8080/messages/${this.chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .subscribe({
          next: data => {
            this.messages = data.map(msg => ({
              ...msg,
              sender: msg.senderUsername,
              read: Boolean(msg.read)
            }));

            this.messages.forEach(msg => {
              const isRecipient =
                  msg.recipientUsername?.toLowerCase() === this.username?.toLowerCase();
              if (isRecipient && !msg.read) {
                this.chatSocketService.markMessageAsRead(msg.id);
              }
            });

            this.scrollToBottom();
          },
          error: err => {
            console.error('[CHAT] Failed to load chat history:', err);
          }
        });
  }

  closeChat(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        const container = this.messageContainer?.nativeElement;
        container.scrollTop = container.scrollHeight;
      } catch (err) {
        console.warn('[CHAT] Failed to scroll:', err);
      }
    });
  }

  setMenuContext(msg: any): void {
    this.menuContext = msg;
  }
}
