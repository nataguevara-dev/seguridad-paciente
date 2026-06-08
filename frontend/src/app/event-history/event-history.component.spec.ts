import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventHistoryComponent } from './event-history.component';
import { SafetyEvent } from '../services/events.service';

describe('EventHistoryComponent', () => {
  let component: EventHistoryComponent;
  let mockEventsService: { getFilteredEvents: ReturnType<typeof vi.fn> };
  let mockCdr: { detectChanges: ReturnType<typeof vi.fn> };

  const mockEvents: SafetyEvent[] = [
    {
      id: '1', patientId: 'p1', patientFirstName: 'John', patientLastName: 'Doe',
      reporterId: 'r1', service: 'Urgencias', location: 'Hospital Central',
      occurredAt: '2026-05-04T10:00:00', description: 'Patient fall',
      notificationStatus: 'sent', createdAt: new Date().toISOString()
    },
    {
      id: '2', patientId: 'p2', patientFirstName: 'Jane', patientLastName: 'Smith',
      reporterId: 'r1', service: 'Medicina Interna', location: 'Piso 3',
      occurredAt: '2026-05-05T14:00:00', description: 'Medication error',
      notificationStatus: 'pending', createdAt: new Date().toISOString()
    }
  ];

  const mockResponse = {
    events: mockEvents,
    pagination: { total: 2, page: 1, pageSize: 20, totalPages: 1 }
  };

  beforeEach(() => {
    mockEventsService = { getFilteredEvents: vi.fn() };
    mockCdr = { detectChanges: vi.fn() };
    component = new EventHistoryComponent({ navigate: vi.fn() } as any, mockEventsService as any, mockCdr as any);
  });

  describe('Initialization', () => {
    it('should have default state', () => {
      expect(component.events).toEqual([]);
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(20);
      expect(component.totalPages).toBe(0);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.selectedEvent).toBeNull();
    });

    it('should generate years list', () => {
      const currentYear = new Date().getFullYear();
      expect(component.years).toHaveLength(6);
      expect(component.years[0]).toBe(currentYear);
      expect(component.years[5]).toBe(currentYear - 5);
    });

    it('should load events on init', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.ngOnInit();
      expect(mockEventsService.getFilteredEvents).toHaveBeenCalledWith({}, 1, 20);
    });
  });

  describe('loadEvents', () => {
    it('should populate events on success', async () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      await component.loadEvents();

      expect(component.events).toHaveLength(2);
      expect(component.total).toBe(2);
      expect(component.totalPages).toBe(1);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should set error on failure', async () => {
      mockEventsService.getFilteredEvents.mockRejectedValue(new Error('error'));

      await component.loadEvents();

      expect(component.error).toBe('No se pudieron cargar los eventos. Intenta de nuevo más tarde.');
      expect(component.events).toEqual([]);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('applyFilters', () => {
    it('should reset page to 1 and reload', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.currentPage = 3;

      component.applyFilters();

      expect(component.currentPage).toBe(1);
      expect(mockEventsService.getFilteredEvents).toHaveBeenCalled();
    });
  });

  describe('Filter change handlers', () => {
    it('handleMonthChange should parse int and apply', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      const event = { target: { value: '5' } } as any;

      component.handleMonthChange(event);

      expect(component.filters.month).toBe(5);
    });

    it('handleMonthChange should clear filter for empty value', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters.month = 5;
      const event = { target: { value: '' } } as any;

      component.handleMonthChange(event);

      expect(component.filters.month).toBeUndefined();
    });

    it('handleYearChange should parse int and apply', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      const event = { target: { value: '2026' } } as any;

      component.handleYearChange(event);

      expect(component.filters.year).toBe(2026);
    });

    it('handleYearChange should clear filter for empty value', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters.year = 2026;
      const event = { target: { value: '' } } as any;

      component.handleYearChange(event);

      expect(component.filters.year).toBeUndefined();
    });

    it('handleServiceChange should set filter and apply', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      const event = { target: { value: 'Urgencias' } } as any;

      component.handleServiceChange(event);

      expect(component.filters.service).toBe('Urgencias');
    });

    it('handleServiceChange should clear filter for empty value', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters.service = 'Urgencias';
      const event = { target: { value: '' } } as any;

      component.handleServiceChange(event);

      expect(component.filters.service).toBeUndefined();
    });
  });

  describe('Debounced inputs', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('onPatientNameInput should debounce and filter after 300ms', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      component.onPatientNameInput('John');
      expect(component.patientNameFilter).toBe('John');
      expect(mockEventsService.getFilteredEvents).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(component.filters.patientName).toBe('John');
      expect(mockEventsService.getFilteredEvents).toHaveBeenCalled();
    });

    it('onPatientNameInput should not filter for single character', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      component.onPatientNameInput('J');
      vi.advanceTimersByTime(300);

      expect(component.filters.patientName).toBeUndefined();
    });

    it('onPatientNameInput should reset for empty string', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      component.onPatientNameInput('');
      vi.advanceTimersByTime(300);

      expect(component.filters.patientName).toBeUndefined();
    });

    it('onClinicalHistoryInput should debounce and filter after 300ms', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      component.onClinicalHistoryInput('HC001');
      vi.advanceTimersByTime(300);

      expect(component.filters.clinicalHistoryNumber).toBe('HC001');
      expect(mockEventsService.getFilteredEvents).toHaveBeenCalled();
    });

    it('should clear previous debounce timer on new input', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      component.onPatientNameInput('John');
      component.onPatientNameInput('Johnn');
      vi.advanceTimersByTime(300);

      expect(mockEventsService.getFilteredEvents).toHaveBeenCalledTimes(1);
    });

    it('should clear previous debounce timer on clinical history input', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);

      component.onClinicalHistoryInput('HC001');
      component.onClinicalHistoryInput('HC002');
      vi.advanceTimersByTime(300);

      expect(mockEventsService.getFilteredEvents).toHaveBeenCalledTimes(1);
    });
  });

  describe('Page navigation', () => {
    it('changePage should update page and load', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.totalPages = 5;

      component.changePage(3);

      expect(component.currentPage).toBe(3);
      expect(mockEventsService.getFilteredEvents).toHaveBeenCalled();
    });

    it('changePage should not load for invalid pages', () => {
      component.totalPages = 5;

      component.changePage(0);
      expect(mockEventsService.getFilteredEvents).not.toHaveBeenCalled();

      component.changePage(6);
      expect(mockEventsService.getFilteredEvents).not.toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters and reload', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters = { month: 5, year: 2026, service: 'Urgencias', patientName: 'John', clinicalHistoryNumber: 'HC001' };
      component.patientNameFilter = 'John';
      component.clinicalHistoryFilter = 'HC001';
      component.currentPage = 3;

      component.clearFilters();

      expect(component.filters).toEqual({});
      expect(component.patientNameFilter).toBe('');
      expect(component.clinicalHistoryFilter).toBe('');
      expect(component.currentPage).toBe(1);
      expect(mockEventsService.getFilteredEvents).toHaveBeenCalled();
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters', () => {
      expect(component.hasActiveFilters()).toBe(false);
    });

    it('should return true when any filter is set', () => {
      component.filters.service = 'Urgencias';
      expect(component.hasActiveFilters()).toBe(true);

      component.filters = { month: 5 };
      expect(component.hasActiveFilters()).toBe(true);

      component.filters = { patientName: 'John' };
      expect(component.hasActiveFilters()).toBe(true);
    });
  });

  describe('getFilterChips', () => {
    it('should return empty array when no filters', () => {
      expect(component.getFilterChips()).toEqual([]);
    });

    it('should create chip for month+year', () => {
      component.filters = { month: 5, year: 2026 };
      const chips = component.getFilterChips();
      expect(chips).toContainEqual({ label: 'Mayo 2026', key: 'month' });
    });

    it('should create chip for month only', () => {
      component.filters = { month: 1 };
      const chips = component.getFilterChips();
      expect(chips).toContainEqual({ label: 'Enero', key: 'month' });
    });

    it('should create chip for year only', () => {
      component.filters = { year: 2026 };
      const chips = component.getFilterChips();
      expect(chips).toContainEqual({ label: 'Año 2026', key: 'year' });
    });

    it('should create chip for service', () => {
      component.filters = { service: 'Urgencias' };
      const chips = component.getFilterChips();
      expect(chips).toContainEqual({ label: 'Servicio: Urgencias', key: 'service' });
    });

    it('should create chip for patient name', () => {
      component.filters = { patientName: 'John' };
      const chips = component.getFilterChips();
      expect(chips).toContainEqual({ label: 'Paciente: John', key: 'patientName' });
    });

    it('should create chip for clinical history', () => {
      component.filters = { clinicalHistoryNumber: 'HC001' };
      const chips = component.getFilterChips();
      expect(chips).toContainEqual({ label: 'HC: HC001', key: 'clinicalHistoryNumber' });
    });

    it('should return multiple chips', () => {
      component.filters = { month: 5, year: 2026, service: 'Urgencias' };
      expect(component.getFilterChips()).toHaveLength(2);
    });
  });

  describe('removeFilter', () => {
    it('should clear the specific filter key', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters = { month: 5, year: 2026, service: 'Urgencias' };

      component.removeFilter('month');

      expect(component.filters.month).toBeUndefined();
      expect(component.filters.year).toBe(2026);
      expect(component.filters.service).toBe('Urgencias');
    });

    it('should clear patientNameFilter when removing patientName', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters = { patientName: 'John' };
      component.patientNameFilter = 'John';

      component.removeFilter('patientName');

      expect(component.filters.patientName).toBeUndefined();
      expect(component.patientNameFilter).toBe('');
    });

    it('should clear clinicalHistoryFilter when removing clinicalHistoryNumber', () => {
      mockEventsService.getFilteredEvents.mockResolvedValue(mockResponse);
      component.filters = { clinicalHistoryNumber: 'HC001' };
      component.clinicalHistoryFilter = 'HC001';

      component.removeFilter('clinicalHistoryNumber');

      expect(component.filters.clinicalHistoryNumber).toBeUndefined();
      expect(component.clinicalHistoryFilter).toBe('');
    });
  });

  describe('Modal', () => {
    it('openModal should set selectedEvent', () => {
      component.openModal(mockEvents[0]);
      expect(component.selectedEvent).toBe(mockEvents[0]);
    });

    it('closeModal should clear selectedEvent', () => {
      component.selectedEvent = mockEvents[0];
      component.closeModal();
      expect(component.selectedEvent).toBeNull();
    });
  });

  describe('relativeTime', () => {
    it('should return less than a minute for recent dates', () => {
      const recent = new Date().toISOString();
      expect(component.relativeTime(recent)).toBe('Hace menos de 1 minuto');
    });

    it('should return minutes', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toContain('5 minutos');
    });

    it('should return hours', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toContain('3 horas');
    });

    it('should return days', () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      expect(component.relativeTime(date)).toContain('10 días');
    });

    it('should return formatted date for older events', () => {
      const date = '2025-01-15T10:00:00';
      const result = component.relativeTime(date);
      expect(typeof result).toBe('string');
      expect(result).toBe(new Date(date).toLocaleDateString('es-ES'));
    });
  });

  describe('truncate', () => {
    it('should return empty string for falsy input', () => {
      expect(component.truncate('')).toBe('');
      expect(component.truncate(null as any)).toBe('');
      expect(component.truncate(undefined as any)).toBe('');
    });

    it('should return text unchanged when within limit', () => {
      expect(component.truncate('Hello')).toBe('Hello');
    });

    it('should truncate and add ellipsis when exceeding limit', () => {
      const long = 'A'.repeat(150);
      const result = component.truncate(long, 100);
      expect(result).toHaveLength(103);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should use default max of 100', () => {
      const long = 'A'.repeat(200);
      const result = component.truncate(long);
      expect(result).toHaveLength(103);
    });
  });

  describe('statusClass', () => {
    it('should return green for sent', () => {
      expect(component.statusClass('sent')).toContain('green');
    });

    it('should return red for failed', () => {
      expect(component.statusClass('failed')).toContain('red');
    });

    it('should return yellow for other', () => {
      expect(component.statusClass('pending')).toContain('yellow');
      expect(component.statusClass('unknown')).toContain('yellow');
    });
  });

  describe('statusLabel', () => {
    it('should return Enviado for sent', () => {
      expect(component.statusLabel('sent')).toBe('Enviado');
    });

    it('should return Error for failed', () => {
      expect(component.statusLabel('failed')).toBe('Error');
    });

    it('should return Pendiente for other', () => {
      expect(component.statusLabel('pending')).toBe('Pendiente');
    });
  });

  describe('pageNumbers', () => {
    it('should return empty array when totalPages is 0', () => {
      component.totalPages = 0;
      expect(component.pageNumbers).toEqual([]);
    });

    it('should return correct range around current page', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      expect(component.pageNumbers).toEqual([3, 4, 5, 6, 7]);
    });

    it('should clamp at start', () => {
      component.totalPages = 10;
      component.currentPage = 1;
      expect(component.pageNumbers).toEqual([1, 2, 3]);
    });

    it('should clamp at end', () => {
      component.totalPages = 5;
      component.currentPage = 5;
      expect(component.pageNumbers).toEqual([3, 4, 5]);
    });
  });

  describe('services and months', () => {
    it('should have predefined services', () => {
      expect(component.services).toContain('Urgencias');
      expect(component.services).toContain('Medicina Interna');
      expect(component.services).toHaveLength(5);
    });

    it('should have 12 months', () => {
      expect(component.months).toHaveLength(12);
      expect(component.months[0].label).toBe('Enero');
      expect(component.months[11].label).toBe('Diciembre');
    });
  });
});
