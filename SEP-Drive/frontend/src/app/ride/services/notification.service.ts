import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private client: Client;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {},
    });

    this.client.activate();
  }

  onConnected(callback: () => void) {
    this.client.onConnect = () => callback();
  }

  subscribeToCustomerTopic(callback: (msg: any) => void) {
    this.client.subscribe('/topic/customer', (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  }

  subscribeToDriverTopic(callback: (msg: any) => void) {
    this.client.subscribe('/topic/driver', (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  }
}
