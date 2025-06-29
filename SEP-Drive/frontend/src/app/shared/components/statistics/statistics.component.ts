import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

// 1. Typ für die verfügbaren Datenkategorien
type ChartKey = 'earnings' | 'distance' | 'duration' | 'rating';

interface ChartData {
  labels: string[];
  data: number[];
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone:false
})
export class StatisticsComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;

  // Auswahloptionen
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

  years = [2022, 2023, 2024];
  months = [
    { value: 1, name: 'Januar' }, { value: 2, name: 'Februar' }, { value: 3, name: 'März' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mai' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Dezember' }
  ];

  // 2. Typing für fakeData
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

  getChartData(): ChartData {
    if (this.viewMode === 'monthly') {
      return {
        labels: this.months.map(m => m.name),
        data: this.fakeData[this.selectedChartType].monthly
      };
    } else {
      // 30 Tage als Beispiel
      const days = Array.from({length: 30}, (_, i) => `${i + 1}.`);
      return {
        labels: days,
        data: this.fakeData[this.selectedChartType].daily
      };
    }
  }

  updateChart() {
    const chartData = this.getChartData();

    const label = this.chartTypeOptions.find(opt => opt.value === this.selectedChartType)?.label ?? '';
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: this.selectedChartType === 'rating' ? 'bar' : 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label,
          data: chartData.data,
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
