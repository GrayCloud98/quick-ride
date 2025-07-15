import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private stompClient!: Client;
  private messageSubject = new Subject<any>();
  private connectedSubject = new Subject<void>();

  public messages$ = this.messageSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();

  connect(sender: string, recipient: string): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str) => console.log('[WebSocket]', str),
    });

    this.stompClient.onConnect = () => {
      console.log('[WebSocket] Connected');

      const topic1 = `/topic/chat/offer-${sender}-${recipient}`;
      const topic2 = `/topic/chat/offer-${recipient}-${sender}`;

      [topic1, topic2].forEach(topic => {
        this.stompClient.subscribe(topic, (message: IMessage) => {
          const body = JSON.parse(message.body);
          console.log(`[RECEIVED][${topic}]`, body);
          this.messageSubject.next(body);
        });
      });

      this.connectedSubject.next();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('[WebSocket] Error', frame);
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  sendMessage(payload: any): void {
    this.stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(payload)
    });
  }

  editMessage(payload: any, token: string): void {
    this.stompClient.publish({
      destination: '/app/chat/edit',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  deleteMessage(payload: any, token: string): void {
    this.stompClient.publish({
      destination: '/app/chat/delete',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  markMessageAsRead(messageId: number): void {
    const token = localStorage.getItem('authToken');
    if (!this.stompClient || !this.stompClient.connected || !token) return;

    const payload = {
      messageId,
      token
    };

    console.log('[MARK READ] Sending payload:', payload);

    this.stompClient.publish({
      destination: '/app/chat/read',
      body: JSON.stringify(payload)
    });
  }
}
