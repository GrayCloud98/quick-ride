import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

type ChartKey = 'earnings' | 'distance' | 'duration' | 'rating';



@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone:false
})
export class StatisticsComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;

  chartTypeOptions = [
    { label: 'Einnahmen', value: 'earnings' },
    { label: 'Distanz', value: 'distance' },
    { label: 'Fahrzeit', value: 'duration' },
    { label: 'Bewertung', value: 'rating' }
  ];

  selectedChartType: ChartKey = 'earnings';
  viewMode: 'monthly' | 'daily' = 'monthly';
  selectedYear = 2024;
  selectedMonth = 6; // Juni

  years = [2024,2025,2026];
  months = [
    { value: 0, name: 'Januar' }, { value: 1, name: 'Februar' }, { value: 2, name: 'März' },
    { value: 3, name: 'April' }, { value: 4, name: 'Mai' }, { value: 5, name: 'Juni' },
    { value: 6, name: 'Juli' }, { value: 7, name: 'August' }, { value: 8, name: 'September' },
    { value: 9, name: 'Oktober' }, { value: 10, name: 'November' }, { value: 11, name: 'Dezember' }
  ];

  //  Typing für fakeData
  fakeData: Record<ChartKey, { monthly: number[]; daily: number[] }> = {
    earnings: {
      monthly:   [450, 500, 480, 520, 490, 610, 700, 680, 620, 630, 550, 600],
      daily:     Array.from({length: 30}, () => Math.floor(Math.random() * 60) + 20)
    },
    distance: {
      monthly:   [1200, 1100, 1150, 1300, 1270, 1400, 1600, 1580, 1460, 1420, 1250, 1300],
      daily:     Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 10)
    },
    duration: {
      monthly:   [90, 85, 100, 110, 115, 120, 135, 130, 125, 122, 100, 115],
      daily:     Array.from({length: 30}, () => Math.floor(Math.random() * 5) + 2)
    },
    rating: {
      monthly:   [4.8, 4.7, 4.9, 5.0, 4.8, 4.9, 4.6, 4.7, 4.8, 4.9, 4.8, 4.9],
      daily:     Array.from({length: 30}, () => Number((Math.random() * 0.4 + 4.6).toFixed(2)))
    }
  };

  ngOnInit() {
    this.updateChart();
  }

  onTypeChange(type: ChartKey) {
    this.selectedChartType = type;
    this.updateChart();
  }

  onViewModeChange(mode: 'monthly' | 'daily') {
    this.viewMode = mode;
    this.updateChart();
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.updateChart();
  }

  onMonthChange(month: number) {
    this.selectedMonth = month;
    this.updateChart();
  }


  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  updateChart() {
    let labels: string[];
    let data: number[];

    if (this.viewMode === 'monthly') {
      labels = this.months.map(m => m.name);
      data = this.fakeData[this.selectedChartType].monthly;
    } else {
      const daysInMonth = this.getDaysInMonth(this.selectedYear, this.selectedMonth);
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}.`);
      data = Array.from({ length: daysInMonth }, (_, i) =>
        this.fakeData[this.selectedChartType].daily[i] ?? 0
      );
    }

    const label = this.chartTypeOptions.find(opt => opt.value === this.selectedChartType)?.label ?? '';
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: this.selectedChartType === 'rating' ? 'bar' : 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

}
