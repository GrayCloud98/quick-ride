import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {AuthService} from "../../../auth/auth.service";

export interface RideHistory {
  id: string;
  date: string;
  distance: string;
  duration: string;
  money: number;
  customerRating: number;
  driverRating: number;
  customerName: string;
  customerUsername: string;
  driverUsername: string;
  driverName: string;
}

@Component({
  selector: 'app-ridehistorye',
  templateUrl: './ridehistory.component.html',
  styleUrls: ['./ridehistory.component.scss'],
  standalone: false
})
export class RidehistoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [];
  constructor(
    private readonly authService: AuthService
  ) {
  }
  dataSource = new MatTableDataSource<RideHistory>([
    {
      id: '#123',
      date: '21/05/2025 14:32',
      distance: '10 km',
      duration: '18 min',
      money: 18,
      customerRating: 5,
      driverRating: 4,
      customerName: 'Schulz',
      customerUsername: 'alex.s',
      driverUsername: 'm',
      driverName: 'Müller'
    },
    {
      id: '#123',
      date: '21/05/2025 14:32',
      distance: '10 km',
      duration: '18 min',
      money: 18,
      customerRating: 5,
      driverRating: 4,
      customerName: 'salmen',
      customerUsername: 'dridi',
      driverUsername: 'khreff',
      driverName: 'mohammed'
    }
    // ... weitere Daten
  ]);
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
          // Kunde: Fahrer-Spalten
          this.displayedColumns = [
            'id', 'date', 'distance', 'duration', 'money',
            'driverRating', 'driverName', 'driverUsername'
          ];
        } else {
          // Fahrer: Kunden-Spalten
          this.displayedColumns = [
            'id', 'date', 'distance', 'duration', 'money',
            'customerRating', 'customerName', 'customerUsername'
          ];
        }
        // FilterPredicate jetzt setzen (nach displayedColumns!)
        this.dataSource.filterPredicate = (data: RideHistory, filter: string) => {
          const searchString = this.displayedColumns
            .map(col => (data as any)[col]?.toString().toLowerCase() ?? '')
            .join(' ');
          return searchString.includes(filter.trim().toLowerCase());
        };
      },
      error: err => {
        console.error("Rollenabfrage fehlgeschlagen:", err);
        // Optional: Standardanzeige
        this.displayedColumns = [
          'id', 'date', 'distance', 'duration', 'money',
          'driverRating', 'driverName', 'driverUsername',
          'customerRating', 'customerName', 'customerUsername'
        ];
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
