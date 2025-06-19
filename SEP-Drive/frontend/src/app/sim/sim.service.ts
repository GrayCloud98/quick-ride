import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface Update {
  rideSimulationId: number,
  paused: boolean,
  hasStarted: boolean,
  currentIndex: number,
  duration: number,
  startPoint: {lat: number, lng: number},
  endPoint: {lat: number, lng: number}
}
export enum Control {
  FETCH = 'fetch',
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
  private baseUrl = 'http://localhost:8080/api/ride-requests';

  constructor(private http: HttpClient) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this.client.onConnect = () => {

      this.http.get<number>(this.baseUrl + '/sim-id').subscribe({
        next: id => console.log('[SIM ID][SUCCESS]', 'Received simulation ID:', id),
        error: err => console.warn('[SIM ID][ERROR]', 'Failed to retrieve simulation ID:', err),
      });

      console.log('✅ WebSocket connected');
      this.client.subscribe(`/topic/simulation/${this.simulationId}`, (message: IMessage) => {
        const body = JSON.parse(message.body);
        this.simulationUpdateSubject.next(body);
      });
      this.control(this.simulationId, Control.FETCH);
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

  async disconnect(): Promise<void> {
    try {
      await this.client.deactivate();
      console.log('🛑 WebSocket disconnected cleanly');
    } catch (error) {
      console.error('⚠️ Error during WebSocket disconnection:', error);
    }
  }

  control(input: number, control: Control): void {
    const payload: any = { rideSimulationId: this.simulationId };

    if (control === Control.SPEED)
      payload.duration = input;
    else
      payload.currentIndex = input;

    this.client.publish({
      destination: `/app/simulation/${control}`,
      body: JSON.stringify(payload)
    });
  }

  getSimulationUpdates(): Observable<any> {
    return this.simulationUpdateSubject.asObservable();
  }
}
