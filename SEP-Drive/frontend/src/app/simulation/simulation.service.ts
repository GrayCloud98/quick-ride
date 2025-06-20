import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Observable, Subject, switchMap} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';

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
  SPEED = 'speed',
  COMPLETE = 'complete',
}
@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private client: Client;
  private simulationUpdateSubject = new Subject<any>();

  private simulationId = 1;
  private baseUrl = 'http://localhost:8080/api/ride-requests';

  constructor(private http: HttpClient,
              private authService: AuthService) {  // FIXME COMMENT OUT
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this.client.onConnect = () => {
      console.log('✅ WebSocket connected');
      this.client.subscribe(`/topic/simulation/${this.simulationId}`, (message: IMessage) => {
        const body = JSON.parse(message.body);
        this.simulationUpdateSubject.next(body);
      });
      this.control(Control.FETCH);
    };

    this.client.onStompError = (frame) => {
      console.error('⚠️ STOMP Error:', frame);
    };

    this.client.onWebSocketClose = () => {
      console.warn('🚪 WebSocket closed');
    };
  }

  // FIXME UNCOMMENT TO UPDATE simulationId DYNAMICALLY
  // constructor(private http: HttpClient) {
  //   this.client = new Client({
  //     webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  //     reconnectDelay: 5000,
  //     debug: () => {}
  //   });
  //
  //   this.client.onConnect = () => {
  //
  //     this.http.get<number>(this.baseUrl + '/sim-id').subscribe({
  //       next: id => {
  //         console.log('[SIM ID][SUCCESS]', 'Received simulation ID:', id);
  //         this.simulationId = id;
  //
  //         console.log('✅ WebSocket connected');
  //         this.client.subscribe(
  //           `/topic/simulation/${this.simulationId}`,
  //           (message: IMessage) => this.simulationUpdateSubject.next(JSON.parse(message.body))
  //         );
  //         this.control(this.simulationId, Control.FETCH);
  //       },
  //       error: err => console.warn('[SIM ID][ERROR]', 'Simulation ID retrieval must be on START:', err),
  //     });
  //   };
  //
  //   this.client.onStompError = (frame) => {
  //     console.error('⚠️ STOMP Error:', frame);
  //   };
  //
  //   this.client.onWebSocketClose = () => {
  //     console.warn('🚪 WebSocket closed');
  //   };
  // }

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
  //  FETCH = 'fetch',
  //   START = 'start',
  //   PAUSE = 'pause',
  //   RESUME = 'resume',
  //   SPEED = 'speed',
  //   COMPLETE = 'complete',

  /*
  * input:
  * START, PAUSE, RESUME = currentIndex
  * SPEED = duration
  * FETCH, COMPLETE = *leave empty*
  * */
  control(control: Control, input?: number): void {
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

  rate(rate: number): Observable<any> {
    const params = new HttpParams()
      .set('rideSimulationId', this.simulationId.toString())
      .set('rate', rate.toString());

    return this.authService.isCustomer().pipe(
      switchMap(isCustomer => {
        const suffix = isCustomer ? '/rate/driver' : '/rate/customer';
        const url = this.baseUrl + suffix;
        return this.http.post(url, null, { params });
      })
    );
  }
}
