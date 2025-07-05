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
  editingMessageId: number | null = null;
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
      const payload = {
        messageId: this.editingMessageId,
        newContent: trimmed
      };
      this.chatSocketService.editMessage(payload, token);
      this.editingMessageId = null;
    } else {
      const payload = {
        chatId: this.chatId,
        senderUsername: this.username,
        recipientUsername: this.recipient,
        content: trimmed,
        timestamp: new Date().toISOString()
      };
      this.chatSocketService.sendMessage(payload);
    }

    this.newMessage = '';
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.newMessage = '';
  }

  startEdit(msg: any): void {
    this.editingMessageId = msg.id;
    this.newMessage = msg.content;
  }

  deleteMessage(msg: any): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const payload = {
      messageId: msg.id,
      otherUsername: this.recipient
    };
    this.chatSocketService.deleteMessage(payload, token);
  }

  canEditOrDelete(msg: any): boolean {
    return msg.sender === this.username && !msg.read && !msg.deleted;
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

        this.messages.forEach(msg => {
          const isRecipient = msg.recipientUsername?.toLowerCase() === this.username?.toLowerCase();
          if (isRecipient && !msg.read) {
            this.chatSocketService.markMessageAsRead(msg.id);
          }
        });

        this.scrollToBottom();
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
