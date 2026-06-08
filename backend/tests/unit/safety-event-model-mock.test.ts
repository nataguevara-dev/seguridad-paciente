import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SafetyEventModel } from '../../src/models/safety-event';

function createMockDb() {
  const mockPrepare = vi.fn();
  const mockRun = vi.fn();
  const mockGet = vi.fn();
  const mockAll = vi.fn();

  mockPrepare.mockReturnValue({ run: mockRun, get: mockGet, all: mockAll });

  return { prepare: mockPrepare, _run: mockRun, _get: mockGet, _all: mockAll };
}

describe('SafetyEventModel', () => {
  let model: SafetyEventModel;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
    model = new SafetyEventModel(db as any);
  });

  describe('create', () => {
    it('should insert a new event', async () => {
      db._run.mockReturnValue({ changes: 1 });
      const data = {
        patientId: 'p1',
        reporterId: 'r1',
        service: 'Urgencias',
        location: 'Hospital',
        occurredAt: '2026-01-01T10:00:00Z',
        description: 'Test event'
      };

      const result = await model.create(data);

      expect(result.id).toBeDefined();
      expect(result.service).toBe('Urgencias');
      expect(result.notificationStatus).toBe('pending');
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO safety_events'));
      expect(db._run).toHaveBeenCalled();
    });
  });

  describe('findRecent', () => {
    it('should return recent events with patient info', async () => {
      const mockRows = [
        { id: 'e1', patientId: 'p1', patientFirstName: 'Ana', patientLastName: 'Pérez' }
      ];
      db._all.mockReturnValue(mockRows);

      const result = await model.findRecent(5);

      expect(result).toEqual(mockRows);
      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('JOIN patients'));
      expect(db._all).toHaveBeenCalledWith(5);
    });
  });

  describe('findFiltered', () => {
    it('should return paginated filtered results', async () => {
      db._get.mockReturnValue({ count: 1 });
      db._all.mockReturnValue([{ id: 'e1', patientId: 'p1' }]);

      const result = await model.findFiltered({ service: 'Urgencias' }, 1, 20);

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.events).toHaveLength(1);
    });

    it('should return 0 totalPages when no results', async () => {
      db._get.mockReturnValue({ count: 0 });
      db._all.mockReturnValue([]);

      const result = await model.findFiltered({}, 1, 20);

      expect(result.totalPages).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('should return aggregated statistics', async () => {
      db._all
        .mockReturnValueOnce([{ service: 'Urgencias', count: 5 }])
        .mockReturnValueOnce([{ month: 1, year: 2026, count: 5 }])
        .mockReturnValueOnce([{ hour: 10, count: 3 }])
        .mockReturnValueOnce([{ patientId: 'p1', patientName: 'Ana Pérez', eventCount: 5 }]);

      const result = await model.getStatistics({});

      expect(result.byService).toHaveLength(1);
      expect(result.monthlyHistogram).toHaveLength(1);
      expect(result.byHour).toHaveLength(1);
      expect(result.topPatients).toHaveLength(1);
      expect(db._all).toHaveBeenCalledTimes(4);
    });

    it('should handle top 10 ties by including extra rows', async () => {
      const rows = Array.from({ length: 11 }, (_, i) => ({
        patientId: `p${i}`,
        patientName: `Patient ${i}`,
        eventCount: i < 10 ? 10 - i : 5
      }));
      db._all
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce(rows);

      const result = await model.getStatistics({});

      expect(result.topPatients.length).toBeGreaterThanOrEqual(10);
    });

    it('should apply date filters when provided', async () => {
      db._all
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      await model.getStatistics({ from: '2026-01-01', to: '2026-06-30' });

      const prepareCalls = db.prepare.mock.calls;
      for (const call of prepareCalls) {
        expect(call[0]).toContain('WHERE');
      }
    });
  });
});
