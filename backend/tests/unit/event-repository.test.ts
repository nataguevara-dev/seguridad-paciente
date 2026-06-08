import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventRepository } from '../../src/repositories/event-repository';
import { SafetyEventModel } from '../../src/models/safety-event';
import type { StatisticsFilters, StatisticsResult, EventFilters, SafetyEvent } from '../../src/models/safety-event';

describe('EventRepository', () => {
  let eventRepository: EventRepository;
  let mockModel: Partial<SafetyEventModel>;

  const mockEvent: SafetyEvent = {
    id: 'e1', patientId: 'p1', reporterId: 'r1', service: 'Urgencias',
    location: 'Hospital', occurredAt: '2026-01-01T10:00:00Z',
    description: 'Test', notificationStatus: 'pending', createdAt: '2026-01-01T10:00:00Z'
  };

  const mockStatisticsResult: StatisticsResult = {
    byService: [{ service: 'Urgencias', count: 5 }],
    monthlyHistogram: [{ month: 6, year: 2026, count: 5 }],
    byHour: [{ hour: 14, count: 3 }],
    topPatients: [{ patientId: 'p1', patientName: 'Ana Pérez', eventCount: 2 }]
  };

  beforeEach(() => {
    mockModel = {
      create: vi.fn().mockResolvedValue(mockEvent),
      findByReporterId: vi.fn().mockResolvedValue([mockEvent]),
      findRecent: vi.fn().mockResolvedValue([mockEvent]),
      findFiltered: vi.fn().mockResolvedValue({
        events: [mockEvent], total: 1, page: 1, pageSize: 20, totalPages: 1
      }),
      updateNotificationStatus: vi.fn().mockResolvedValue(undefined),
      getStatistics: vi.fn().mockResolvedValue(mockStatisticsResult)
    };
    eventRepository = new EventRepository(mockModel as SafetyEventModel);
  });

  describe('create', () => {
    it('should delegate to model', async () => {
      const data = { patientId: 'p1', reporterId: 'r1', service: 'Urgencias', location: 'Hospital', occurredAt: '2026-01-01T10:00:00Z', description: 'Test' };
      const result = await eventRepository.create(data);
      expect(result).toEqual(mockEvent);
      expect(mockModel.create).toHaveBeenCalledWith(data);
    });
  });

  describe('findByReporterId', () => {
    it('should delegate to model', async () => {
      const result = await eventRepository.findByReporterId('r1');
      expect(result).toHaveLength(1);
      expect(mockModel.findByReporterId).toHaveBeenCalledWith('r1');
    });
  });

  describe('findRecent', () => {
    it('should delegate to model with default limit', async () => {
      const result = await eventRepository.findRecent();
      expect(result).toHaveLength(1);
      expect(mockModel.findRecent).toHaveBeenCalledWith(10);
    });
  });

  describe('findFiltered', () => {
    it('should delegate to model', async () => {
      const filters: EventFilters = { service: 'Urgencias' };
      const result = await eventRepository.findFiltered(filters, 1, 20);
      expect(result.events).toHaveLength(1);
      expect(mockModel.findFiltered).toHaveBeenCalledWith(filters, 1, 20);
    });
  });

  describe('updateNotificationStatus', () => {
    it('should delegate to model', async () => {
      await eventRepository.updateNotificationStatus('e1', 'sent');
      expect(mockModel.updateNotificationStatus).toHaveBeenCalledWith('e1', 'sent', undefined);
    });
  });

  describe('getStatistics', () => {
    it('should delegate to model without filters', async () => {
      const result = await eventRepository.getStatistics({});
      expect(result).toEqual(mockStatisticsResult);
      expect(mockModel.getStatistics).toHaveBeenCalledWith({});
    });

    it('should delegate with date filters', async () => {
      const filters: StatisticsFilters = { from: '2026-01-01', to: '2026-06-30' };
      const result = await eventRepository.getStatistics(filters);
      expect(result).toEqual(mockStatisticsResult);
      expect(mockModel.getStatistics).toHaveBeenCalledWith(filters);
    });
  });
});
