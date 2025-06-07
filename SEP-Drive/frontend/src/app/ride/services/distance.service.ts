import { Injectable } from '@angular/core';
import { VehicleClass } from '../models/ride.model';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class DistanceService {

  constructor() {}

  getDistanceDurationAndPrice(
    origin: string | google.maps.LatLngLiteral,
    destination: string | google.maps.LatLngLiteral,
    vehicleClass: VehicleClass
  ): Promise<{ distance: number; duration: number; estimatedPrice: number }> {

    return new Promise((resolve, reject) => {
      if (!google || !google.maps) {
        reject('Google Maps JS API not loaded');
        return;
      }

      const service = new google.maps.DistanceMatrixService();

      const request = {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      };

      service.getDistanceMatrix(request, (response: google.maps.DistanceMatrixResponse, status: string) => {
        if (status !== 'OK') {
          reject('Error from Google Distance Matrix API: ' + status);
          return;
        }

        if (!response.rows || response.rows.length === 0 || !response.rows[0].elements || response.rows[0].elements.length === 0) {
          reject('Invalid response structure');
          return;
        }

        const element = response.rows[0].elements[0];
        if (element.status !== 'OK') {
          reject('Route not found between the specified locations');
          return;
        }

        const distanceInKm = element.distance.value / 1000;
        const durationInMin = element.duration.value / 60;

        const priceFactor = this.getPriceFactor(vehicleClass);
        const estimatedPrice = distanceInKm * priceFactor;

        resolve({
          distance: parseFloat(distanceInKm.toFixed(2)),
          duration: parseFloat(durationInMin.toFixed(0)),
          estimatedPrice: parseFloat(estimatedPrice.toFixed(2)),
        });
      });
    });
  }

  private getPriceFactor(vehicleClass: VehicleClass): number {
    switch(vehicleClass) {
      case VehicleClass.SMALL: return 1.0;
      case VehicleClass.MEDIUM: return 2.0;
      case VehicleClass.LARGE: return 10.0;
      default: return 1.0;
    }
  }
}
