import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventsService } from './events.service';
import { AuthService } from './auth.service';

describe('EventsService', () => {
  let service: EventsService;
  let mockAuthService: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { getToken: vi.fn().mockReturnValue('test-token') };
    service = new EventsService(mockAuthService as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch recent events with token', async () => {
      const mockEvents = [{ id: '1', service: 'Urgencias' }];
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { events: mockEvents } })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.getEvents(10);

      expect(result).toEqual(mockEvents);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/events?limit=10', expect.objectContaining({
        headers: { 'Authorization': 'Bearer test-token', 'Content-Type': 'application/json' }
      }));
    });

    it('should use default limit of 10', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { events: [] } })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      await service.getEvents();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'), expect.any(Object));
    });

    it('should throw when response not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as any);

      await expect(service.getEvents(5)).rejects.toThrow('Failed to fetch events');
    });
  });

  describe('getFilteredEvents', () => {
    it('should build query string from filters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { events: [{ id: '1' }], pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 } }
        })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.getFilteredEvents(
        { month: 5, year: 2026, service: 'Urgencias' },
        1, 20
      );

      expect(result.events).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('month=5'), expect.any(Object));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('year=2026'), expect.any(Object));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('service=Urgencias'), expect.any(Object));
    });

    it('should encode special characters in filter values', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { events: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } }
        })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      await service.getFilteredEvents({ patientName: 'José María', clinicalHistoryNumber: 'HC/001' });

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('José María')), expect.any(Object));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('HC/001')), expect.any(Object));
    });

    it('should omit undefined filters from query', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { events: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } }
        })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      await service.getFilteredEvents({}, 2, 10);

      const url = (fetch as any).mock.calls[0][0] as string;
      expect(url).toContain('page=2');
      expect(url).toContain('pageSize=10');
      expect(url).not.toContain('month=');
      expect(url).not.toContain('year=');
    });

    it('should throw when response not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as any);

      await expect(service.getFilteredEvents({})).rejects.toThrow('Failed to fetch filtered events');
    });
  });
});
