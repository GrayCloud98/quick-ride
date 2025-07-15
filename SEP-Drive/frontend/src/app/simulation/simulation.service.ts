import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BehaviorSubject, Observable, Subject, switchMap} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {Point} from './simulation-page/simulation.component'
import {VehicleClass} from '../ride/models/ride.model';

export interface Update {
  rideSimulationId: number,
  paused: boolean,
  hasStarted: boolean,
  duration: number,
  startPoint: { lat: number, lng: number },
  endPoint: { lat: number, lng: number }
  startLocationName: string,
  destinationLocationName: string,
  currentIndex: number,
  waypoints: { address: string, latitude: number, longitude: number, sequenceOrder: number, name: string }[];
  hasChanged: boolean,
  startAddress: string,
  destinationAddress: string,
  rideStatus: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED'
}

export enum Control {
  FETCH = 'fetch',
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  SPEED = 'speed',
  CHANGE = 'change-points',
  COMPLETE = 'complete'
}
@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private client: Client;
  private simulationUpdate = new Subject<Update>();
  public simulationUpdate$ = this.simulationUpdate.asObservable();

  private simulationId: number | null = null;
  private baseUrl = 'http://localhost:8080/api/ride-requests';

  constructor(private http: HttpClient,
              private authService: AuthService) {

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this.client.onConnect = () => {
      this.http.get<number>(this.baseUrl + '/sim-id').subscribe({
        next: id => {
          this.simulationId = id;
          this.client.subscribe(
            `/topic/simulation/${this.simulationId}`,
            (message: IMessage) => this.simulationUpdate.next( JSON.parse(message.body) )
          );
          this.control(Control.FETCH);
        },
        error: err => console.error('Fetching simulationId failed', err),
      });
    };

    this.client.onStompError = (frame) => console.error('STOMP Error:', frame)
    this.client.onWebSocketClose = () => console.warn('WebSocket closed')
  }

  connect(): void {
    this.client.activate();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.deactivate();
    } catch (error) {
      console.error('⚠️ Error during WebSocket disconnection:', error);
    }
  }

  getVehicleClass(): Observable<VehicleClass>{
    return this.http.get<VehicleClass>(this.baseUrl + '/sim/driver/vehicle-class');
  }

  getRideDetails(): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/active-sim-price');
  }

  rate(rate: number) {
    const params = new HttpParams()
      .set('rideSimulationId', this.simulationId!.toString())
      .set('rate', rate.toString());

    return this.authService.isCustomer().pipe(
      switchMap(
        isCustomer => {
          const suffix = isCustomer ? '/rate/driver' : '/rate/customer';
          const url = this.baseUrl + suffix;
          return this.http.post(url, null, { params });
        }
      )
    );
  }

  control(control: Control, currentIndexOrDuration?: number,
          points?: Point[], rideDetails?: { distance: number; duration: number; price: number } // LIVE ÄNDERUNGEN WÄHREND DER FAHRT
  ): void {
    const payload: any = { rideSimulationId: this.simulationId };

    switch (control) {
      case Control.SPEED:
        payload.duration = currentIndexOrDuration;
        break;

      // LIVE ÄNDERUNGEN WÄHREND DER FAHRT
      case Control.CHANGE:
        if (!points || points.length < 2) return;
        const cleanWaypoint = (point: Point, index: number) => ({
          latitude: point.lat,
          longitude: point.lng,
          address: point.address,
          name: point.name,
          sequenceOrder: index,
        });

        payload.currentIndex = currentIndexOrDuration;
        payload.startPoint = { lat: points[0].lat,lng: points[0].lng };
        payload.waypoints = points.slice(1, points.length - 1).map((p, i) => cleanWaypoint(p, i));
        payload.endPoint = { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng };
        payload.destinationLocationName = points[points.length - 1].name;
        payload.destinationAddress = points[points.length - 1].address;
        payload.distance = rideDetails?.distance;
        payload.duration = rideDetails?.duration;
        payload.price = rideDetails?.price;
        break;
      // ENDE DER LIVE ÄNDERUNGEN WÄHREND DER FAHRT

      default:
        payload.currentIndex = currentIndexOrDuration;
        break;
    }

    this.client.publish({
      destination: `/app/simulation/${control}`,
      body: JSON.stringify(payload)
    });
  }

  private activeSimulationStatus = new BehaviorSubject<boolean>(false);
  public activeSimulationStatus$ = this.activeSimulationStatus.asObservable();

  public userHasActiveSimulation(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/has-active-sim`);
  }

  updateActiveSimulationStatus(): void {
    this.userHasActiveSimulation().subscribe({
      next: status => this.activeSimulationStatus.next(status),
      error: err => console.error(err)
    });
  }
}
