import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Location} from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private apiKey = 'AIzaSyBk_dCClCld6uiQIDcHjNDdkGiZo-p6qM4'
  private apiUrl = `https://www.googleapis.com/geolocation/v1/geolocate?key=${this.apiKey}`;
  constructor(private http: HttpClient) { }

  getLocation(): Observable<Location> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      homeMobileCountryCode: 310,
      homeMobileNetworkCode: 410,
      radioType: 'gsm',
      carrier: 'Vodafone',
      considerIp: true
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => ({
        name: "My Location",
        address: 'undefined',
        latitude: response.location.lat,
        longitude: response.location.lng
      }))
    );
  }

}
