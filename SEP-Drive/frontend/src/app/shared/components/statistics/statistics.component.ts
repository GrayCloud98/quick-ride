import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
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
    { label: 'Income', value: 'totalPrice' },
    { label: 'Distance', value: 'totalDistance' },
    { label: 'TravelTime', value: 'totalTravelledTime' },
    { label: 'Rating', value: 'averageRating' }
  ];
  selectedChartType: ChartKey = 'totalPrice';

  viewMode: 'monthly' | 'daily' = 'monthly';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  years = [2025];
  months = [
    { value: 1, name: 'Jan' }, { value: 2, name: 'Feb' }, { value: 3, name: 'Mar' },
    { value: 4, name: 'Apr' }, { value: 5, name: 'May' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' }, { value: 8, name: 'Aug' }, { value: 9, name: 'Sep' },
    { value: 10, name: 'Oct' }, { value: 11, name: 'Nov' }, { value: 12, name: 'Dec' }
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
        const statByMonth = new Map(stats.map(s => [s.month, s[this.selectedChartType]]));

        const labels = this.months.map(m => m.name);
        const data = this.months.map(m => statByMonth.get(m.value) ?? 0);

        this.renderChart(labels, data);
        this.loading = false;
      }, () => this.loading = false);
    } else {
      this.statisticsService.getDailyStats(this.selectedYear, this.selectedMonth).subscribe((stats: DriverDailyStatsDto[]) => {
        const statByDay = new Map(stats.map(s => [s.day, s[this.selectedChartType]]));
        const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

        const labels = Array.from({length: daysInMonth}, (_, i) => `${i + 1}.`);
        const data = Array.from({length: daysInMonth}, (_, i) => statByDay.get(i + 1) ?? 0);

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
          borderColor: '#38bdf8',
          backgroundColor: 'rgb(179,10,234)',
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#fff',
              font: { size: 16, weight: 700 }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#222e3a',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#38bdf8',
            borderWidth: 1,
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#fff',
              font: { size: 12, weight: 400 },
              maxRotation: 40,
              minRotation: 25,
              autoSkip: false,
            },
            grid: {
              color: 'rgba(255,255,255,0.13)'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#fff',
              font: { size: 12 },
              maxRotation: 40,
              minRotation: 25,
              autoSkip: true,
              maxTicksLimit: 6
            },
            grid: {
              color: 'rgba(255,255,255,0.13)'
            }
          }
        }
      }
    });
  }
}
