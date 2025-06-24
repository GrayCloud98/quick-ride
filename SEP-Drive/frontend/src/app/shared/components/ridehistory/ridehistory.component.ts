import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AuthService } from "../../../auth/auth.service";
import { RideHistoryService, TripHistoryDTO } from '../../services/ridehistory.service';

@Component({
  selector: 'app-ridehistorye',
  templateUrl: './ridehistory.component.html',
  styleUrls: ['./ridehistory.component.scss'],
  standalone: false
})
export class RidehistoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id', 'date', 'distance', 'duration', 'amount',
    'driverRating', 'driverName', 'driverUsername',
    'customerRating', 'customerName', 'customerUsername'
  ];

  constructor(
    private rideHistoryService: RideHistoryService,
    private readonly authService: AuthService
  ) {}

  dataSource = new MatTableDataSource<TripHistoryDTO>([]);
  loading = true;
  error: string | null = null;

  columnHeaders: { [key: string]: string } = {
    id: 'Ride-id',
    date: 'Date/Time',
    distance: 'Distance',
    duration: 'Duration',
    amount: 'Money',
    driverRating: 'DriverRating',
    driverName: 'DriverName',
    driverUsername: 'DriverUsername',
    customerRating: 'CustomerRating',
    customerName: 'CustomerName',
    customerUsername: 'CustomerUsername'
  };

  @ViewChild(MatSort) sort!: MatSort;
  iscustomer: boolean | null = null;

  ngOnInit() {
    this.authService.isCustomer().subscribe({
      next: iscustomer => {
        this.iscustomer = iscustomer;
        if (iscustomer) {
          this.displayedColumns = [
            'id', 'date', 'distance', 'duration', 'amount',
            'driverRating', 'driverName', 'driverUsername'
          ];
        } else {
          this.displayedColumns = [
            'id', 'date', 'distance', 'duration', 'amount',
            'customerRating', 'customerName', 'customerUsername'
          ];
        }
        this.rideHistoryService.getTripHistory().subscribe({
          next: (history) => {
            this.dataSource.data = history;
            this.loading = false;
          },
          error: () => {
            this.error = '';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Role could not be determined';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getColumnHeader(column: string): string {
    return this.columnHeaders[column] || column;
  }
}
