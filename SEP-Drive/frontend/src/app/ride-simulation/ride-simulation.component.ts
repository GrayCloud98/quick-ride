import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RideRatingDialogComponent } from '../ride-rating-dialog/ride-rating-dialog.component';

@Component({
selector: 'app-ride-simulation',
standalone: false,
templateUrl: './ride-simulation.component.html',
styleUrls: ['./ride-simulation.component.scss']
})
export class RideSimulationComponent {
constructor(private dialog: MatDialog) {} // ✅ Add this
center: google.maps.LatLngLiteral = { lat: 51.1657, lng: 10.4515 }; // Central Germany
zoom = 7;

// Simulated route points (mock)
route: google.maps.LatLngLiteral[] = [
{ lat: 51.4508, lng: 7.0134 }, // Essen
{ lat: 51.2, lng: 7.5 },
{ lat: 50.6, lng: 8.3 },
{ lat: 50.1109, lng: 8.6821 },  // Frankfurt
{ lat: 50.5, lng: 9.2 },
{ lat: 51.0, lng: 11.0 },
{ lat: 52.0, lng: 12.0 },
{ lat: 52.5200, lng: 13.4050 }  // Berlin
];

markerPosition: google.maps.LatLngLiteral = this.route[0];
isRunning = false;
speed = 15; // Total time in seconds
progress = 0;
intervalId: any;
eta: number =0;

startSimulation(): void {
    if (this.isRunning || this.progress >= this.route.length - 1) return;
    this.isRunning = true;

    const intervalTime = (this.speed * 1000) / (this.route.length - 1);
    this.eta = Math.round((this.route.length - 1 - this.progress) * intervalTime / 1000);

    this.intervalId = setInterval(() => {
      if (this.progress < this.route.length - 1) {
        this.progress++;
        this.markerPosition = this.route[this.progress];

        // Recalculate ETA based on remaining steps
        const remainingSteps = this.route.length - 1 - this.progress;
        this.eta = Math.round((remainingSteps * intervalTime) / 1000);
      } else {
        this.stopSimulation();
      }
    }, intervalTime);

    // Initialize ETA at the start
    const remainingSteps = this.route.length - 1 - this.progress;
    this.eta = Math.round((remainingSteps * intervalTime) / 1000);
  }

  pauseSimulation(): void {
    this.isRunning = false;
    clearInterval(this.intervalId);
  }

  stopSimulation(): void {
    this.pauseSimulation();
    this.progress = 0;
    this.markerPosition = this.route[0];
     this.eta = 0;

    // Show rating dialog after ride ends
    this.dialog.open(RideRatingDialogComponent).afterClosed().subscribe(rating => {
      if (rating) {
        console.log('User rated the ride:', rating);
        // TODO: send to backend or show confirmation
      }
    });
  }

  onSpeedChange(value: number): void {
    this.speed = Number(value);
    if (this.isRunning) {
      this.pauseSimulation();
      this.startSimulation(); // Restart at new speed
    }
  }

  handleSpeedInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const value = Number(inputElement.value);
  this.onSpeedChange(value);
}

   get formattedEta(): string {
    const minutes = Math.floor(this.eta / 60);
    const seconds = this.eta % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
