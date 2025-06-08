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

    this.client.onConnect = () => {
      this.client.subscribe('/topic/customer', (message: IMessage) => {
        const parsed = JSON.parse(message.body);
        this.customerCallback?.(parsed);
      });

      this.client.subscribe('/topic/driver', (message: IMessage) => {
        const parsed = JSON.parse(message.body);
        this.driverCallback?.(parsed);
      });
    };

    this.client.activate();
  }

  private customerCallback?: (msg: any) => void;
  private driverCallback?: (msg: any) => void;

  setCustomerCallback(callback: (msg: any) => void) {
    this.customerCallback = callback;
  }

  setDriverCallback(callback: (msg: any) => void) {
    this.driverCallback = callback;
  }
}
