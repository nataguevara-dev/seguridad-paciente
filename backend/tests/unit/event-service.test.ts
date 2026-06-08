import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventService } from '../../src/services/event-service';
import { EventRepository } from '../../src/repositories/event-repository';
import { PatientRepository } from '../../src/repositories/patient-repository';
import { NotificationService } from '../../src/services/notification-service';
import type { SafetyEvent, StatisticsFilters, StatisticsResult } from '../../src/models';

describe('EventService', () => {
  let eventService: EventService;
  let eventRepository: Partial<EventRepository>;
  let patientRepository: Partial<PatientRepository>;
  let notificationService: Partial<NotificationService>;

  beforeEach(() => {
    eventRepository = {
      create: vi.fn().mockResolvedValue({
        id: 'event-1',
        patientId: 'patient-1',
        reporterId: 'reporter-1',
        service: 'Urgencias',
        location: 'Hospital Central',
        occurredAt: '2026-05-04T10:00:00Z',
        description: 'Test event description',
        notificationStatus: 'pending',
        createdAt: '2026-05-04T10:00:00Z'
      }),
      findByReporterId: vi.fn().mockResolvedValue([]),
      updateNotificationStatus: vi.fn().mockResolvedValue(undefined),
      getStatistics: vi.fn().mockResolvedValue({
        byService: [{ service: 'Urgencias', count: 10 }],
        monthlyHistogram: [{ month: 1, year: 2026, count: 10 }],
        byHour: [{ hour: 10, count: 5 }],
        topPatients: [{ patientId: 'p1', patientName: 'Ana Pérez', eventCount: 3 }]
      } as StatisticsResult)
    };

    patientRepository = {
      findByClinicalHistoryNumber: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        clinicalHistoryNumber: '12345',
        documentType: 'Cédula',
        documentNumber: '1234567890',
        birthDate: '1990-01-01'
      })
    };

    notificationService = {
      sendSupervisorNotification: vi.fn().mockResolvedValue({
        success: true,
        message: 'Notification sent successfully'
      })
    };

    eventService = new EventService(
      eventRepository as EventRepository,
      patientRepository as PatientRepository,
      notificationService as NotificationService
    );
  });

  describe('createEvent', () => {
    it('should create a safety event successfully', async () => {
      const eventData = {
        patient: {
          firstName: 'John',
          lastName: 'Doe',
          clinicalHistoryNumber: '12345',
          documentType: 'Cédula',
          documentNumber: '1234567890',
          birthDate: '1990-01-01'
        },
        service: 'Urgencias',
        location: 'Hospital Central',
        occurredAt: '2026-05-04T10:00:00Z',
        description: 'Test event with sufficient description for validation'
      };

      const result = await eventService.createEvent(eventData, 'reporter-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('event-1');
      expect(result.reporterId).toBe('reporter-1');
      expect(result.patientId).toBe('patient-1');
    });

    it('should validate required fields', async () => {
      const invalidEventData = {
        patient: {
          firstName: '',
          lastName: 'Doe',
          clinicalHistoryNumber: '12345',
          documentType: 'Cédula',
          documentNumber: '1234567890',
          birthDate: '1990-01-01'
        },
        service: 'Urgencias',
        location: 'Hospital Central',
        occurredAt: '2026-05-04T10:00:00Z',
        description: 'Test'
      };

      try {
        await eventService.createEvent(invalidEventData, 'reporter-1');
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Validation failed');
      }
    });

    it('should create patient if not exists', async () => {
      const eventData = {
        patient: {
          firstName: 'Jane',
          lastName: 'Doe',
          clinicalHistoryNumber: '54321',
          documentType: 'Cédula',
          documentNumber: '0987654321',
          birthDate: '1995-05-05'
        },
        service: 'Cirugía',
        location: 'Quirófano 1',
        occurredAt: '2026-05-04T14:00:00Z',
        description: 'Test event for new patient with required length'
      };

      await eventService.createEvent(eventData, 'reporter-1');

      expect(patientRepository.create).toHaveBeenCalled();
    });

    it('should trigger notification after event creation', async () => {
      const eventData = {
        patient: {
          firstName: 'John',
          lastName: 'Doe',
          clinicalHistoryNumber: '12345',
          documentType: 'Cédula',
          documentNumber: '1234567890',
          birthDate: '1990-01-01'
        },
        service: 'Urgencias',
        location: 'Hospital Central',
        occurredAt: '2026-05-04T10:00:00Z',
        description: 'Test event for notification trigger with minimum length'
      };

      await eventService.createEvent(eventData, 'reporter-1');

      // Give async notification time to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(notificationService.sendSupervisorNotification).toHaveBeenCalled();
    });
  });

  describe('getEventsByReporter', () => {
    it('should retrieve events for a reporter', async () => {
      await eventService.getEventsByReporter('reporter-1');

      expect(patientRepository.findByClinicalHistoryNumber).not.toHaveBeenCalled();
      expect(eventRepository.findByReporterId).toHaveBeenCalledWith('reporter-1');
    });
  });

  describe('getEvents', () => {
    it('should return recent events', async () => {
      eventRepository.findRecent = vi.fn().mockResolvedValue([
        { id: 'e1' } as SafetyEvent
      ]);

      const result = await eventService.getEvents(5);

      expect(result).toHaveLength(1);
      expect(eventRepository.findRecent).toHaveBeenCalledWith(5);
    });

    it('should default to 10 events', async () => {
      eventRepository.findRecent = vi.fn().mockResolvedValue([]);

      await eventService.getEvents();

      expect(eventRepository.findRecent).toHaveBeenCalledWith(10);
    });
  });

  describe('getFilteredEvents', () => {
    it('should return paginated filtered events', async () => {
      eventRepository.findFiltered = vi.fn().mockResolvedValue({
        events: [{ id: 'e1' }],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      });

      const result = await eventService.getFilteredEvents({ service: 'Urgencias' }, 1, 20);

      expect(result.events).toHaveLength(1);
      expect(eventRepository.findFiltered).toHaveBeenCalledWith({ service: 'Urgencias' }, 1, 20);
    });

    it('should validate month range', async () => {
      try {
        await eventService.getFilteredEvents({ month: 13 }, 1, 20);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('month must be between 1 and 12');
      }
    });

    it('should validate year range', async () => {
      try {
        await eventService.getFilteredEvents({ year: 1800 }, 1, 20);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('year must be between 1900 and 2099');
      }
    });

    it('should clamp page and pageSize', async () => {
      eventRepository.findFiltered = vi.fn().mockResolvedValue({
        events: [], total: 0, page: 1, pageSize: 50, totalPages: 0
      });

      await eventService.getFilteredEvents({}, 0, 100);

      expect(eventRepository.findFiltered).toHaveBeenCalledWith({}, 1, 50);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics without filters', async () => {
      const result = await eventService.getStatistics({});

      expect(result).toBeDefined();
      expect(result.byService).toHaveLength(1);
      expect(result.monthlyHistogram).toHaveLength(1);
      expect(result.byHour).toHaveLength(1);
      expect(result.topPatients).toHaveLength(1);
      expect(eventRepository.getStatistics).toHaveBeenCalledWith({});
    });

    it('should pass date filters to repository', async () => {
      const filters: StatisticsFilters = {
        from: '2026-01-01',
        to: '2026-06-30'
      };

      await eventService.getStatistics(filters);

      expect(eventRepository.getStatistics).toHaveBeenCalledWith(filters);
    });

    it('should throw when from date is after to date', async () => {
      const filters: StatisticsFilters = {
        from: '2026-06-30',
        to: '2026-01-01'
      };

      try {
        await eventService.getStatistics(filters);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid date range');
      }
    });
  });
});
