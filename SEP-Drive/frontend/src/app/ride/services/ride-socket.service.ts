import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RideSocketService {
  private client: Client;
  private subscriptions: StompSubscription[] = [];

  private positionSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
  public  position$       = this.positionSubject.asObservable();

  private acceptedSubject = new BehaviorSubject<boolean>(false);
  public  acceptedRide$   = this.acceptedSubject.asObservable();

  constructor() {
    // Create a STOMP client that uses SockJS under the hood
    this.client = new Client({
      // we don’t set brokerURL because we’re using SockJS
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      // debug: (str) => console.log(str),
    });

    this.client.onConnect = () => {
      console.log('✅ STOMP over SockJS connected');
      // Resubscribe to any previously requested topics:
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
    };

    this.client.onStompError = frame => {
      console.error('❌ STOMP protocol error:', frame.headers['message']);
    };

    // Activate (establish) the connection:
    this.client.activate();
  }

  subscribeToRide(rideId: string): void {
    if (!this.client.connected) {
      console.warn('🚧 Not connected yet; skipping ride subscription');
      return;
    }
    const sub = this.client.subscribe(
      `/topic/ride/${rideId}/position`,
      (message: IMessage) => {
        const pos = JSON.parse(message.body);
        this.positionSubject.next(pos);
      }
    );
    this.subscriptions.push(sub);
  }

  sendPositionUpdate(rideId: string, position: { lat: number; lng: number }): void {
    if (!this.client.connected) return;
    this.client.publish({
      destination: `/app/ride/${rideId}/position`,
      body: JSON.stringify(position),
    });
  }

  subscribeToRideAccepted(rideRequestId: number): void {
    if (!this.client.connected) return;
    const sub = this.client.subscribe(
      `/topic/ride/${rideRequestId}/accepted`,
      () => {
        this.acceptedSubject.next(true);
      }
    );
    this.subscriptions.push(sub);
  }
}
