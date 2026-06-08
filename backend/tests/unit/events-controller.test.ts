import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventsController } from '../../src/controllers/events-controller';
import { EventService } from '../../src/services/event-service';
import { AuthService } from '../../src/services/auth-service';
import { ValidationError } from '../../src/shared/validation';
import type { Request, Response } from 'express';
import type { StatisticsResult } from '../../src/models/safety-event';

describe('EventsController', () => {
  let controller: EventsController;
  let mockEventService: Partial<EventService>;
  let mockAuthService: Partial<AuthService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const mockStats: StatisticsResult = {
    byService: [],
    monthlyHistogram: [],
    byHour: [],
    topPatients: []
  };

  beforeEach(() => {
    mockAuthService = {
      verifyToken: vi.fn().mockResolvedValue({ id: 'user-1', email: 'test@test.com', role: 'reporter' })
    };

    mockEventService = {
      createEvent: vi.fn().mockResolvedValue({ id: 'e1' }),
      getEvents: vi.fn().mockResolvedValue([]),
      getFilteredEvents: vi.fn().mockResolvedValue({
        events: [], total: 0, page: 1, pageSize: 20, totalPages: 0
      }),
      getStatistics: vi.fn().mockResolvedValue(mockStats)
    };

    controller = new EventsController(
      mockEventService as EventService,
      mockAuthService as AuthService
    );

    mockReq = {
      query: {},
      headers: { authorization: 'Bearer valid-token' }
    };

    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    } as Partial<Response>;
  });

  describe('getStats', () => {
    it('should return statistics successfully', async () => {
      await controller.getStats(mockReq as Request, mockRes as Response);
      expect(mockEventService.getStatistics).toHaveBeenCalledWith({});
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should pass from/to query params to service', async () => {
      mockReq.query = { from: '2026-01-01', to: '2026-06-30' };
      await controller.getStats(mockReq as Request, mockRes as Response);
      expect(mockEventService.getStatistics).toHaveBeenCalledWith({ from: '2026-01-01', to: '2026-06-30' });
    });

    it('should return 401 if not authenticated', async () => {
      mockReq.headers = {};
      await controller.getStats(mockReq as Request, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 on service error', async () => {
      mockEventService.getStatistics = vi.fn().mockRejectedValue(new Error('DB error'));
      await controller.getStats(mockReq as Request, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createEvent', () => {
    it('should create event and return 201', async () => {
      mockReq.body = { patient: {}, service: 'Urgencias', location: 'Hospital', occurredAt: '2026-01-01', description: 'Test' };
      await controller.createEvent(mockReq as Request, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 401 if not authenticated', async () => {
      mockReq.headers = {};
      await controller.createEvent(mockReq as Request, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 on validation error', async () => {
      mockEventService.createEvent = vi.fn().mockRejectedValue(new ValidationError('Invalid'));
      await controller.createEvent(mockReq as Request, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getEvents', () => {
    it('should return events list', async () => {
      await controller.getEvents(mockReq as Request, mockRes as Response);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should support limit parameter', async () => {
      mockReq.query = { limit: '5' };
      await controller.getEvents(mockReq as Request, mockRes as Response);
      expect(mockEventService.getEvents).toHaveBeenCalledWith(5);
    });

    it('should support pagination parameters', async () => {
      mockReq.query = { page: '2', pageSize: '10' };
      await controller.getEvents(mockReq as Request, mockRes as Response);
      expect(mockEventService.getFilteredEvents).toHaveBeenCalledWith({}, 2, 10);
    });

    it('should pass filter parameters', async () => {
      mockReq.query = { service: 'Urgencias' };
      await controller.getEvents(mockReq as Request, mockRes as Response);
      expect(mockEventService.getFilteredEvents).toHaveBeenCalledWith(
        expect.objectContaining({ service: 'Urgencias' }), 1, 20
      );
    });

    it('should return 401 if not authenticated', async () => {
      mockReq.headers = {};
      await controller.getEvents(mockReq as Request, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
