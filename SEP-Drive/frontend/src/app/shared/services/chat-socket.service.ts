import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import  SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private stompClient!: Client;
  private messageSubject = new Subject<any>();

  public messages$ = this.messageSubject.asObservable();

  connect(chatId: string): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      debug: (str) => console.log('[WebSocket]', str),
    });

    this.stompClient.onConnect = () => {
      console.log('[WebSocket] Connected');
      this.stompClient.subscribe(`/topic/chat/${chatId}`, (message: IMessage) => {
        const body = JSON.parse(message.body);
        console.log('[RECEIVED]', body);
        this.messageSubject.next(body);
      });
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

  editMessage(payload: any): void {
    this.stompClient.publish({
      destination: '/app/chat.editMessage',
      body: JSON.stringify(payload)
    });
  }

  deleteMessage(payload: any): void {
    this.stompClient.publish({
      destination: '/app/chat.deleteMessage',
      body: JSON.stringify(payload)
    });
  }
}
