import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private client: Client;
  private isConnected = false;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {},
    });

    this.client.onConnect = () => {
      this.isConnected = true;
      if (this.pendingUsername) {
        this.subscribeToUserTopics(this.pendingUsername);
        this.pendingUsername = null;
      }
    };

    this.client.activate();
  }

  private customerCallback?: (msg: any) => void;
  private driverCallback?: (msg: any) => void;
  private pendingUsername: string | null = null;

  setCustomerCallback(callback: (msg: any) => void) {
    this.customerCallback = callback;
  }

  setDriverCallback(callback: (msg: any) => void) {
    this.driverCallback = callback;
  }

  subscribe(username: string) {
    if (this.isConnected) {
      this.subscribeToUserTopics(username);
    } else {
      this.pendingUsername = username;
    }
  }

  private subscribeToUserTopics(username: string) {
    this.client.subscribe(`/topic/customer/${username}`, (message: IMessage) => {
      const parsed = JSON.parse(message.body);
      this.customerCallback?.(parsed);
    });

    this.client.subscribe(`/topic/driver/${username}`, (message: IMessage) => {
      const parsed = JSON.parse(message.body);
      this.driverCallback?.(parsed);
    });
  }
}
