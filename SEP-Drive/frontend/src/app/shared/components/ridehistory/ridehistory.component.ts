import { Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AfterViewInit } from '@angular/core';
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
export class RidehistoryComponent implements OnInit ,AfterViewInit {
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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
      customerName: 'Alex Schulz',
      customerUsername: 'alex.s',
      driverUsername: 'max.m',
      driverName: 'Max Müller'
    },
    // weitere Dummy-Zeilen...
  ]);
  displayedColumns: string[] = [
    'id', 'date', 'distance', 'duration', 'money',
    'customerRating', 'driverRating', 'customerName', 'customerUsername', 'driverUsername', 'driverName'
  ];
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
  }

}
