import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ChatSocketService } from '../shared/services/chat-socket.service';
import { HttpClient } from '@angular/common/http';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chatId!: string;
  @Input() username!: string;
  @Input() recipient!: string;

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: any[] = [];
  newMessage = '';
  private messageSub!: Subscription;

  constructor(
      private chatSocketService: ChatSocketService,
      private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    this.chatSocketService.connect(this.username, this.recipient);
    (window as any).chatSocketService = this.chatSocketService;

    await firstValueFrom(this.chatSocketService.connected$);
    this.loadChatHistory();

    this.messageSub = this.chatSocketService.messages$.subscribe((msg: any) => {
      msg.sender = msg.senderUsername;
      msg.read = Boolean(msg.read);

      console.log('[DEBUG] Incoming message:', {
        id: msg.id,
        sender: msg.senderUsername,
        recipient: msg.recipientUsername,
        read: msg.read,
        localUser: this.username
      });

      const isRecipient =
          msg.recipientUsername?.toLowerCase() === this.username?.toLowerCase();

      if (isRecipient && !msg.read) {
        console.log('[CHECK] I am the recipient — marking as read:', msg.id);
        this.chatSocketService.markMessageAsRead(msg.id);
      } else {
        console.log('[SKIP] Not recipient or already read:', {
          recipient: msg.recipientUsername,
          me: this.username,
          read: msg.read
        });
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

    const payload = {
      chatId: this.chatId,
      senderUsername: this.username,
      recipientUsername: this.recipient,
      content: trimmed,
      timestamp: new Date().toISOString()
    };

    this.chatSocketService.sendMessage(payload);
    this.newMessage = '';
  }

  private loadChatHistory(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[CHAT] No auth token found, skipping message load.');
      return;
    }

    this.http.get<any[]>(`/messages/${this.chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.messages = data.map(msg => ({
          ...msg,
          sender: msg.senderUsername,
          read: Boolean(msg.read)
        }));

        console.table(this.messages.map(m => ({
          id: m.id,
          from: m.senderUsername,
          to: m.recipientUsername,
          read: m.read,
          me: this.username
        })));

        this.messages.forEach(msg => {
          const isRecipient = msg.recipientUsername?.toLowerCase() === this.username?.toLowerCase();
          if (isRecipient && !msg.read) {
            console.log('[AUTO-READ] Marking unread message on load:', msg.id);
            this.chatSocketService.markMessageAsRead(msg.id);
          }
        });

        this.scrollToBottom();
        console.log('[CHAT] History loaded:', this.messages.length, 'messages');
      },
      error: (err) => {
        console.error('[CHAT] Failed to load chat history:', err);
      }
    });
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
}
