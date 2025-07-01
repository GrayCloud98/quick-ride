import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service'; // Pfad ggf. anpassen
import Chart from 'chart.js/auto';

type ChartKey = 'totalPrice' | 'totalDistance' | 'totalTravelledTime' | 'averageRating';

export interface DriverStatsDto {
  month: number;
  totalPrice: number;
  totalDistance: number;
  totalTravelledTime: number;
  averageRating: number;
}
export interface DriverDailyStatsDto {
  day: number;
  totalPrice: number;
  totalDistance: number;
  totalTravelledTime: number;
  averageRating: number;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone : false
})
export class StatisticsComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  chartTypeOptions = [
    { label: 'Einnahmen', value: 'totalPrice' },
    { label: 'Distanz', value: 'totalDistance' },
    { label: 'Fahrzeit', value: 'totalTravelledTime' },
    { label: 'Bewertung', value: 'averageRating' }
  ];
  selectedChartType: ChartKey = 'totalPrice';

  viewMode: 'monthly' | 'daily' = 'monthly';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1; // ACHTUNG: +1 für API (Januar = 1)

  years = [ 2024, 2025];
  months = [
    { value: 1, name: 'Januar' }, { value: 2, name: 'Februar' }, { value: 3, name: 'März' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mai' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Dezember' }
  ];

  loading = false;

  constructor(private statisticsService: StatisticsService) {}

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

  updateChart() {
    this.loading = true;

    if (this.chart) {
      this.chart.destroy();
    }

    if (this.viewMode === 'monthly') {
      this.statisticsService.getMonthlyStats(this.selectedYear).subscribe((stats: DriverStatsDto[]) => {
        const labels = stats.map(s => this.months[s.month - 1].name); // Monatsnamen holen
        const data = stats.map(s => s[this.selectedChartType]);
        this.renderChart(labels, data);
        this.loading = false;
      }, () => this.loading = false);
    } else {
      this.statisticsService.getDailyStats(this.selectedYear, this.selectedMonth).subscribe((stats: DriverDailyStatsDto[]) => {
        const labels = stats.map(s => `${s.day}.`);
        const data = stats.map(s => s[this.selectedChartType]);
        this.renderChart(labels, data);
        this.loading = false;
      }, () => this.loading = false);
    }
  }

  renderChart(labels: string[], data: number[]) {
    const label = this.chartTypeOptions.find(opt => opt.value === this.selectedChartType)?.label ?? '';
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: this.selectedChartType === 'averageRating' ? 'bar' : 'line',
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
