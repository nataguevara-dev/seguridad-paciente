import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let mockAuthService: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { getToken: vi.fn().mockReturnValue('stats-token') };
    service = new StatisticsService(mockAuthService as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockStats = {
    byService: [{ service: 'Urgencias', count: 30 }, { service: 'Medicina Interna', count: 20 }],
    monthlyHistogram: [{ month: 1, year: 2026, count: 10 }, { month: 2, year: 2026, count: 15 }],
    byHour: [{ hour: 8, count: 5 }, { hour: 10, count: 8 }],
    topPatients: [{ patientId: '1', patientName: 'John Doe', eventCount: 5 }]
  };

  it('should fetch statistics without filters', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ data: mockStats })
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    const result = await service.getStatistics();

    expect(result).toEqual(mockStats);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/events/stats', expect.objectContaining({
      headers: { 'Authorization': 'Bearer stats-token', 'Content-Type': 'application/json' }
    }));
  });

  it('should include date filter query params when provided', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ data: mockStats })
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await service.getStatistics({ from: '2026-01-01', to: '2026-06-30' });

    const url = (fetch as any).mock.calls[0][0] as string;
    expect(url).toContain('from=2026-01-01');
    expect(url).toContain('to=2026-06-30');
  });

  it('should encode filter values', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ data: mockStats })
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await service.getStatistics({ from: '2026-01-01' });

    const url = (fetch as any).mock.calls[0][0] as string;
    expect(url).toContain('from=2026-01-01');
    expect(url).not.toContain('to=');
  });

  it('should throw on error response with message', async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'Server error' })
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await expect(service.getStatistics()).rejects.toThrow('Server error');
  });

  it('should throw generic error when response has no message', async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({})
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await expect(service.getStatistics()).rejects.toThrow('Failed to fetch statistics');
  });

  it('should throw generic error when json parsing fails on error', async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockRejectedValue(new Error('parse error'))
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await expect(service.getStatistics()).rejects.toThrow('Failed to fetch statistics');
  });
});
