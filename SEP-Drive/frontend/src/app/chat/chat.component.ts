import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChatSocketService } from '../shared/services/chat-socket.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

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

  messages: any[] = [];
  newMessage = '';
  private messageSub!: Subscription;

  constructor(
    private chatSocketService: ChatSocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadChatHistory();
    this.chatSocketService.connect(this.chatId);

    this.messageSub = this.chatSocketService.messages$.subscribe((msg: any) => {
      console.log('[PUSH TO MESSAGES]', msg);
      this.messages.push(msg);
    });
  }

  ngOnDestroy(): void {
    this.chatSocketService.disconnect();
    if (this.messageSub) this.messageSub.unsubscribe();
  }

  send(): void {
    if (!this.newMessage.trim()) return;

    console.log('[CHAT DEBUG]', {
      chatId: this.chatId,
      senderUsername: this.username,
      recipientUsername: this.recipient,
      content: this.newMessage
    });

    const payload = {
      chatId: this.chatId,
      senderUsername: this.username,
      recipientUsername: this.recipient,
      content: this.newMessage
    };

    this.chatSocketService.sendMessage(payload);
    this.newMessage = '';
  }

  private loadChatHistory(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    console.log('[HISTORY] Loading messages for:', this.chatId);
    this.http.get<any[]>(`/messages/${this.chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => this.messages = data,
      error: (err) => console.error('Failed to load messages:', err)
    });
  }
}
