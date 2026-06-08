import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventStatisticsComponent } from './event-statistics.component';
import { StatisticsData } from '../services/statistics.service';

describe('EventStatisticsComponent', () => {
  let component: EventStatisticsComponent;
  let mockStatsService: { getStatistics: ReturnType<typeof vi.fn> };
  let mockCdr: { detectChanges: ReturnType<typeof vi.fn> };

  const mockData: StatisticsData = {
    byService: [
      { service: 'Urgencias', count: 30 },
      { service: 'Medicina Interna', count: 20 },
      { service: 'Pediatría', count: 15 }
    ],
    monthlyHistogram: [
      { month: 1, year: 2026, count: 10 },
      { month: 2, year: 2026, count: 15 },
      { month: 3, year: 2026, count: 8 }
    ],
    byHour: [
      { hour: 8, count: 5 },
      { hour: 10, count: 8 },
      { hour: 14, count: 12 }
    ],
    topPatients: [
      { patientId: '1', patientName: 'John Doe', eventCount: 5 },
      { patientId: '2', patientName: 'Jane Smith', eventCount: 3 }
    ]
  };

  beforeEach(() => {
    mockStatsService = { getStatistics: vi.fn() };
    mockCdr = { detectChanges: vi.fn() };
    component = new EventStatisticsComponent(mockStatsService as any, mockCdr as any);
  });

  describe('Initialization', () => {
    it('should have default state', () => {
      expect(component.statistics).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.dateError).toBeNull();
      expect(component.filters).toEqual({});
    });

    it('should load statistics on init', () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.ngOnInit();
      expect(mockStatsService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('loadStatistics', () => {
    it('should set statistics and update charts on success', async () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);

      await component.loadStatistics();

      expect(component.statistics).toEqual(mockData);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.serviceChartData.labels).toEqual(['Urgencias', 'Medicina Interna', 'Pediatría']);
      expect(component.monthlyChartData.labels).toContain('Enero 2026');
      expect(component.hourlyChartData.labels).toHaveLength(24);
      expect(component.topPatientsChartData.labels).toEqual(['Jane Smith', 'John Doe']);
    });

    it('should set error state on failure', async () => {
      mockStatsService.getStatistics.mockRejectedValue(new Error('Server error'));

      await component.loadStatistics();

      expect(component.error).toBe('Server error');
      expect(component.statistics).toBeNull();
      expect(component.isLoading).toBe(false);
    });

    it('should set generic error when no message', async () => {
      mockStatsService.getStatistics.mockRejectedValue('string error');

      await component.loadStatistics();

      expect(component.error).toBe('Error al cargar estadísticas');
    });

    it('should pass filters when they exist', async () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.filters = { from: '2026-01-01', to: '2026-06-30' };

      await component.loadStatistics();

      expect(mockStatsService.getStatistics).toHaveBeenCalledWith({ from: '2026-01-01', to: '2026-06-30' });
    });

    it('should not pass empty filters object', async () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.filters = {};

      await component.loadStatistics();

      expect(mockStatsService.getStatistics).toHaveBeenCalledWith(undefined);
    });
  });

  describe('applyDateFilter', () => {
    it('should set error when from > to', () => {
      component.filters = { from: '2026-06-30', to: '2026-01-01' };

      component.applyDateFilter();

      expect(component.dateError).toBe('La fecha "desde" no puede ser posterior a la fecha "hasta"');
      expect(mockStatsService.getStatistics).not.toHaveBeenCalled();
    });

    it('should clear error and load when valid', () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.filters = { from: '2026-01-01', to: '2026-06-30' };
      component.dateError = 'previous error';

      component.applyDateFilter();

      expect(component.dateError).toBeNull();
      expect(mockStatsService.getStatistics).toHaveBeenCalled();
    });

    it('should work with only from date', () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.filters = { from: '2026-01-01' };

      component.applyDateFilter();

      expect(component.dateError).toBeNull();
      expect(mockStatsService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('should reset filters and reload', async () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.filters = { from: '2026-01-01', to: '2026-06-30' };
      component.dateError = 'some error';

      await component.clearFilters();

      expect(component.filters).toEqual({});
      expect(component.dateError).toBeNull();
      expect(mockStatsService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('retry', () => {
    it('should reload statistics', () => {
      mockStatsService.getStatistics.mockResolvedValue(mockData);
      component.retry();
      expect(mockStatsService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('updateCharts', () => {
    it('should return early when statistics is null', () => {
      component.statistics = null;
      component['updateCharts']();
      expect(component.serviceChartData.labels).toEqual([]);
    });

    it('should populate all chart data correctly', () => {
      component.statistics = mockData;

      component['updateCharts']();

      expect(component.serviceChartData.datasets[0].data).toEqual([30, 20, 15]);
      expect(component.serviceChartData.datasets[0].backgroundColor).toHaveLength(3);

      expect(component.monthlyChartData.datasets[0].data).toEqual([10, 15, 8]);

      expect(component.hourlyChartData.datasets[0].data).toHaveLength(24);
      expect(component.hourlyChartData.datasets[0].data[8]).toBe(5);
      expect(component.hourlyChartData.datasets[0].data[10]).toBe(8);
      expect(component.hourlyChartData.datasets[0].data[14]).toBe(12);
      expect(component.hourlyChartData.datasets[0].data[0]).toBe(0);

      expect(component.topPatientsChartData.labels).toEqual(['Jane Smith', 'John Doe']);
      expect(component.topPatientsChartData.datasets[0].data).toEqual([3, 5]);
    });

    it('should handle empty data arrays', () => {
      component.statistics = {
        byService: [],
        monthlyHistogram: [],
        byHour: [],
        topPatients: []
      };

      component['updateCharts']();

      expect(component.serviceChartData.labels).toEqual([]);
      expect(component.monthlyChartData.labels).toEqual([]);
      expect(component.hourlyChartData.datasets[0].data.every((d: number) => d === 0)).toBe(true);
      expect(component.topPatientsChartData.labels).toEqual([]);
    });
  });

  describe('Chart options', () => {
    it('should have responsive charts', () => {
      expect(component.serviceChartOptions.responsive).toBe(true);
      expect(component.monthlyChartOptions.responsive).toBe(true);
      expect(component.hourlyChartOptions.responsive).toBe(true);
      expect(component.topPatientsChartOptions.responsive).toBe(true);
    });

    it('should have top patients chart with horizontal bars', () => {
      expect(component.topPatientsChartOptions.indexAxis).toBe('y');
    });
  });
});
