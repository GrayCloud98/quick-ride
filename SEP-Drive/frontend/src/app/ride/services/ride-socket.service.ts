import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class RideSocketService {
private client: Client;
private subscription?: StompSubscription;

public position$ = new BehaviorSubject<{ lat: number; lng: number } | null>(null);

constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // Replace with your backend WS URL
      reconnectDelay: 5000,
      debug: str => console.log('[WebSocket]', str)
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
    };

    this.client.onStompError = frame => {
      console.error('Broker reported error:', frame.headers['message']);
    };

    this.client.activate();
  }

  subscribeToRide(rideId: string) {
    this.subscription = this.client.subscribe(`/topic/ride-progress/${rideId}`, (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.position$.next(data.position);
    });
  }

  sendPositionUpdate(rideId: string, position: { lat: number; lng: number }) {
    this.client.publish({
      destination: `/app/ride-progress/${rideId}`,
      body: JSON.stringify({ position })
    });
  }

  unsubscribe() {
    this.subscription?.unsubscribe();
  }
}
