import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Observable, Subject} from 'rxjs';

export interface Update {
  rideSimulationId: number,
  paused: boolean,
  hasStarted: boolean,
  currentIndex: number,
  duration: number,
  startPoint: {lat: number, lng: number},
  edndPoint: {lat: number, lng: number}
}
export enum Control {
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  SPEED = 'speed'
}
@Injectable({
  providedIn: 'root'
})
export class SimService {
  private client: Client;
  private simulationUpdateSubject = new Subject<any>();

  private simulationId = 1; // TODO UPDATE DYNAMICALLY

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: log => console.log('📝 Debug log:', log)
    });

    this.client.onConnect = () => {
      console.log('✅ WebSocket connected');
      this.client.subscribe(`/topic/simulation/${this.simulationId}`, (message: IMessage) => {
        const body = JSON.parse(message.body);
        this.simulationUpdateSubject.next(body);
      });
      this.control(30, Control.SPEED); // FIXME BACKEND DOES NOT RETURN DATA ON CONNECTION, THIS LINE IS TO TRIGGER SENDING DATA
    };

    this.client.onStompError = (frame) => {
      console.error('⚠️ STOMP Error:', frame);
    };

    this.client.onWebSocketClose = () => {
      console.warn('🚪 WebSocket closed');
    };
  }

  connect(): void {
    this.client.activate();
  }

  disconnect(): void {
    this.client.deactivate();
  }

  control(input: number, control: Control): void {
    const payload: any = { rideSimulationId: this.simulationId };

    if (control === Control.SPEED)
      payload.duration = input;
    else
      payload.currentIndex = input;

    // TODO DELETE DEBUG
    console.log("💬 control.client.publish:", {destination: `/app/simulation/${control}`, body: JSON.stringify(payload)});

    this.client.publish({
      destination: `/app/simulation/${control}`,
      body: JSON.stringify(payload)
    });
  }

  getSimulationUpdates(): Observable<any> {
    return this.simulationUpdateSubject.asObservable();
  }
}
