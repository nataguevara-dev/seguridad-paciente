import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, BarChart3, Clock, Users, PieChart, RefreshCw } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { StatisticsService, StatisticsData, StatsFilters } from '../services/statistics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-event-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './event-statistics.component.html',
  styleUrls: ['./event-statistics.component.css']
})
export class EventStatisticsComponent implements OnInit {
  readonly BarChart3 = BarChart3;
  readonly Clock = Clock;
  readonly Users = Users;
  readonly PieChart = PieChart;
  readonly RefreshCw = RefreshCw;

  statistics: StatisticsData | null = null;
  filters: StatsFilters = {};
  isLoading = false;
  error: string | null = null;
  dateError: string | null = null;

  serviceChartData: any = { labels: [], datasets: [] };
  monthlyChartData: any = { labels: [], datasets: [] };
  hourlyChartData: any = { labels: [], datasets: [] };
  topPatientsChartData: any = { labels: [], datasets: [] };

  serviceChartOptions: any = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Servicio' } },
      y: { title: { display: true, text: 'Eventos' }, beginAtZero: true }
    }
  };

  monthlyChartOptions: any = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Mes' } },
      y: { title: { display: true, text: 'Casos' }, beginAtZero: true }
    }
  };

  hourlyChartOptions: any = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Hora del día' } },
      y: { title: { display: true, text: 'Eventos' }, beginAtZero: true }
    }
  };

  topPatientsChartOptions: any = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Eventos' }, beginAtZero: true },
      y: { title: { display: true, text: 'Paciente' } }
    }
  };

  serviceChartColors = [
    'rgba(59, 130, 246, 0.7)',
    'rgba(16, 185, 129, 0.7)',
    'rgba(245, 158, 11, 0.7)',
    'rgba(239, 68, 68, 0.7)',
    'rgba(139, 92, 246, 0.7)'
  ];

  constructor(
    private statisticsService: StatisticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  async loadStatistics() {
    this.isLoading = true;
    this.error = null;
    this.dateError = null;
    try {
      const hasFilters = this.filters.from || this.filters.to;
      this.statistics = await this.statisticsService.getStatistics(
        hasFilters ? this.filters : undefined
      );
      this.updateCharts();
    } catch (err: any) {
      this.error = err.message || 'Error al cargar estadísticas';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  applyDateFilter() {
    if (this.filters.from && this.filters.to && this.filters.from > this.filters.to) {
      this.dateError = 'La fecha "desde" no puede ser posterior a la fecha "hasta"';
      return;
    }
    this.dateError = null;
    this.loadStatistics();
  }

  clearFilters() {
    this.filters = {};
    this.dateError = null;
    this.loadStatistics();
  }

  retry() {
    this.loadStatistics();
  }

  private updateCharts() {
    if (!this.statistics) return;

    this.serviceChartData = {
      labels: this.statistics.byService.map(s => s.service),
      datasets: [{
        data: this.statistics.byService.map(s => s.count),
        backgroundColor: this.serviceChartColors.slice(0, this.statistics.byService.length)
      }]
    };

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.monthlyChartData = {
      labels: this.statistics.monthlyHistogram.map(m => `${monthNames[m.month - 1]} ${m.year}`),
      datasets: [{
        data: this.statistics.monthlyHistogram.map(m => m.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      }]
    };

    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const hourMap = new Map(this.statistics.byHour.map(h => [h.hour, h.count]));
    this.hourlyChartData = {
      labels: hourLabels,
      datasets: [{
        data: hourLabels.map((_, i) => hourMap.get(i) || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.7)'
      }]
    };

    this.topPatientsChartData = {
      labels: this.statistics.topPatients.map(p => p.patientName).reverse(),
      datasets: [{
        data: this.statistics.topPatients.map(p => p.eventCount).reverse(),
        backgroundColor: 'rgba(245, 158, 11, 0.7)'
      }]
    };

    this.cdr.detectChanges();
  }
}
