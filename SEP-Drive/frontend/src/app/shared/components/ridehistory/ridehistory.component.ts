import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {AuthService} from "../../../auth/auth.service";
import { RideHistoryService, TripHistoryDTO } from '../../services/ridehistory.service';


@Component({
  selector: 'app-ridehistorye',
  templateUrl: './ridehistory.component.html',
  styleUrls: ['./ridehistory.component.scss'],
  standalone: false
})
export class RidehistoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [];
  constructor(
        private rideHistoryService: RideHistoryService,
        private readonly authService: AuthService
  ) {
  }
  dataSource = new MatTableDataSource<TripHistoryDTO>([]);
  loading = true;
  error: string | null = null;
  @ViewChild(MatSort) sort!: MatSort;

  columnHeaders: { [key: string]: string } = {
    id: 'Fahrt-ID',
    date: 'Datum/Uhrzeit',
    distance: 'Distanz',
    duration: 'Dauer',
    money: 'Geld',
    driverRating: 'Bewertung Fahrer',
    driverName: 'Fahrer',
    driverUsername: 'Benutzername Fahrer',
    customerRating: 'Bewertung Kunde',
    customerName: 'Kunde',
    customerUsername: 'Benutzername Kunde'
  };

  getColumnHeader(column: string): string {
    return this.columnHeaders[column] || column;
  }

  iscustomer :boolean | null= null;
  ngOnInit() {
    this.authService.isCustomer().subscribe({
      next: iscustomer => {
        this.iscustomer = iscustomer;
        if (iscustomer) {
          this.displayedColumns = [
            'id', 'date', 'distance', 'duration', 'money',
            'driverRating', 'driverName', 'driverUsername'
          ];
        } else {
          this.displayedColumns = [
            'id', 'date', 'distance', 'duration', 'money',
            'customerRating', 'customerName', 'customerUsername'
          ];
        }
        this.rideHistoryService.getTripHistory().subscribe({
          next: (history) => {
            this.dataSource.data = history;
            this.loading = false;
          },
          error: (err) => {
            this.error = '';
            this.loading = false;
          }
        });
      },
      error: err => {
        this.error = 'Rolle konnte nicht bestimmt werden';
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
}
