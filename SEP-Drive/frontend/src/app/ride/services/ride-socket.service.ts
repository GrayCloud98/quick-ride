import { Injectable } from '@angular/core';
import { Client, Message, over } from 'stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RideSocketService {
private stompClient!: Client;
private connected = false;

private positionSubject = new BehaviorSubject<{ lat: number, lng: number } | null>(null);
public position$ = this.positionSubject.asObservable();

private acceptedSubject = new BehaviorSubject<boolean>(false);
public acceptedRide$ = this.acceptedSubject.asObservable();

connect(): void {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = over(socket);
    this.stompClient.connect({}, () => {
      this.connected = true;
      console.log('✅ WebSocket connected');
    });
  }

  subscribeToRide(rideId: string): void {
    if (!this.connected) return;

    this.stompClient.subscribe(`/topic/ride/${rideId}/position`, (message: Message) => {
      const position = JSON.parse(message.body);
      this.positionSubject.next(position);
    });
  }

  sendPositionUpdate(rideId: string, position: { lat: number, lng: number }): void {
    if (!this.connected) return;
    this.stompClient.send(`/app/ride/${rideId}/position`, {}, JSON.stringify(position));
  }

  subscribeToRideAccepted(rideRequestId: number): void {
    if (!this.connected) return;

    this.stompClient.subscribe(`/topic/ride/${rideRequestId}/accepted`, () => {
      this.acceptedSubject.next(true);
    });
  }
}
