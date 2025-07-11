import { Injectable } from '@angular/core';
import { VehicleClass } from '../models/ride.model';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class DistanceService {

  constructor() {}

  getDistanceDurationAndPrice(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    vehicleClass: VehicleClass
  ): Promise<{ distance: number; duration: number; estimatedPrice: number }> {
    return this.getDistanceDurationAndPriceForMultiplePoints(
      [origin, destination],
      vehicleClass
    );
  }

  getDistanceDurationAndPriceForMultiplePoints(
    points: google.maps.LatLngLiteral[],
    vehicleClass: VehicleClass
  ): Promise<{ distance: number; duration: number; estimatedPrice: number }> {

    return new Promise((resolve, reject) => {
      if (!google || !google.maps) {
        reject('Google Maps JS API not loaded');
        return;
      }

      if (points.length < 2) {
        reject('At least two points are required');
        return;
      }

      const service = new google.maps.DistanceMatrixService();
      let totalDistance = 0;
      let totalDuration = 0;

      const requests: Promise<void>[] = [];

      for (let i = 0; i < points.length - 1; i++) {
        const origin = points[i];
        const destination = points[i + 1];

        const request = {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        };

        const reqPromise = new Promise<void>((res, rej) => {
          service.getDistanceMatrix(request, (response: google.maps.DistanceMatrixResponse, status: string) => {
            if (status !== 'OK') {
              rej('Error from Google Distance Matrix API: ' + status);
              return;
            }

            const element = response?.rows?.[0]?.elements?.[0];
            if (!element || element.status !== 'OK') {
              rej('Invalid response structure or route not found');
              return;
            }

            totalDistance += element.distance.value;
            totalDuration += element.duration.value;
            res();
          });
        });

        requests.push(reqPromise);
      }

      Promise.all(requests)
        .then(() => {
          const distanceInKm = totalDistance / 1000;
          const durationInMin = totalDuration / 60;
          const priceFactor = this.getPriceFactor(vehicleClass);
          const estimatedPrice = distanceInKm * priceFactor;

          resolve({
            distance: parseFloat(distanceInKm.toFixed(2)),
            duration: parseFloat(durationInMin.toFixed(0)),
            estimatedPrice: parseFloat(estimatedPrice.toFixed(2)),
          });
        })
        .catch(reject);
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
