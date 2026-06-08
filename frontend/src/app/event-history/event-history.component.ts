import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { LucideAngularModule, FileText, Search, X, ChevronLeft, ChevronRight, Filter } from 'lucide-angular';
import { EventsService, SafetyEvent, EventFilters } from '../services/events.service';
import { EventDetailModalComponent } from '../event-detail-modal/event-detail-modal.component';

@Component({
  selector: 'app-event-history',
  standalone: true,
  imports: [NgIf, NgForOf, LucideAngularModule, EventDetailModalComponent],
  templateUrl: './event-history.component.html',
  styleUrls: ['./event-history.component.css']
})
export class EventHistoryComponent implements OnInit {
  readonly FileText = FileText;
  readonly Search = Search;
  readonly X = X;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Filter = Filter;
  readonly Math = Math;

  events: SafetyEvent[] = [];
  filters: EventFilters = {};
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  total = 0;
  isLoading = false;
  error: string | null = null;
  selectedEvent: SafetyEvent | null = null;

  patientNameFilter = '';
  clinicalHistoryFilter = '';

  private debounceTimers: { patientName?: any; clinicalHistory?: any } = {};

  readonly services = [
    'Urgencias',
    'Medicina Interna',
    'Pediatría',
    'Cirugía General',
    'Ginecología'
  ];

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  currentYear = new Date().getFullYear();
  years: number[] = [];

  constructor(
    public router: Router,
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef
  ) {
    for (let y = this.currentYear; y >= this.currentYear - 5; y--) {
      this.years.push(y);
    }
  }

  ngOnInit() {
    this.loadEvents();
  }

  async loadEvents() {
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();
    try {
      const result = await this.eventsService.getFilteredEvents(this.filters, this.currentPage, this.pageSize);
      this.events = result.events;
      this.total = result.pagination.total;
      this.totalPages = result.pagination.totalPages;
    } catch {
      this.error = 'No se pudieron cargar los eventos. Intenta de nuevo más tarde.';
      this.events = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadEvents();
  }

  handleMonthChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filters.month = value ? parseInt(value, 10) : undefined;
    this.applyFilters();
  }

  handleYearChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filters.year = value ? parseInt(value, 10) : undefined;
    this.applyFilters();
  }

  handleServiceChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filters.service = value || undefined;
    this.applyFilters();
  }

  onPatientNameInput(value: string) {
    this.patientNameFilter = value;
    if (this.debounceTimers.patientName) {
      clearTimeout(this.debounceTimers.patientName);
    }
    this.debounceTimers.patientName = setTimeout(() => {
      if (value.length >= 2 || value.length === 0) {
        this.filters.patientName = value || undefined;
        this.applyFilters();
      }
    }, 300);
  }

  onClinicalHistoryInput(value: string) {
    this.clinicalHistoryFilter = value;
    if (this.debounceTimers.clinicalHistory) {
      clearTimeout(this.debounceTimers.clinicalHistory);
    }
    this.debounceTimers.clinicalHistory = setTimeout(() => {
      this.filters.clinicalHistoryNumber = value || undefined;
      this.applyFilters();
    }, 300);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadEvents();
  }

  clearFilters() {
    this.filters = {};
    this.patientNameFilter = '';
    this.clinicalHistoryFilter = '';
    this.currentPage = 1;
    this.loadEvents();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.month || this.filters.year || this.filters.patientName || this.filters.clinicalHistoryNumber || this.filters.service);
  }

  getFilterChips(): { label: string; key: keyof EventFilters }[] {
    const chips: { label: string; key: keyof EventFilters }[] = [];
    if (this.filters.month && this.filters.year) {
      const monthLabel = this.months.find(m => m.value === this.filters.month)?.label || '';
      chips.push({ label: `${monthLabel} ${this.filters.year}`, key: 'month' });
    } else if (this.filters.month) {
      const monthLabel = this.months.find(m => m.value === this.filters.month)?.label || '';
      chips.push({ label: monthLabel, key: 'month' });
    } else if (this.filters.year) {
      chips.push({ label: `Año ${this.filters.year}`, key: 'year' });
    }
    if (this.filters.service) {
      chips.push({ label: `Servicio: ${this.filters.service}`, key: 'service' });
    }
    if (this.filters.patientName) {
      chips.push({ label: `Paciente: ${this.filters.patientName}`, key: 'patientName' });
    }
    if (this.filters.clinicalHistoryNumber) {
      chips.push({ label: `HC: ${this.filters.clinicalHistoryNumber}`, key: 'clinicalHistoryNumber' });
    }
    return chips;
  }

  removeFilter(key: keyof EventFilters) {
    this.filters[key] = undefined;
    if (key === 'patientName') this.patientNameFilter = '';
    if (key === 'clinicalHistoryNumber') this.clinicalHistoryFilter = '';
    this.applyFilters();
  }

  openModal(event: SafetyEvent) {
    this.selectedEvent = event;
  }

  closeModal() {
    this.selectedEvent = null;
  }

  relativeTime(dateString: string): string {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Hace menos de 1 minuto';
    if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
    if (diffHr < 24) return `Hace ${diffHr} hora${diffHr !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  truncate(text: string, max: number = 100): string {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  }

  statusClass(status: string): string {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'failed': return 'Error';
      default: return 'Pendiente';
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
