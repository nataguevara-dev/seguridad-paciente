import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientModel } from '../../src/models/patient';

function createMockDb() {
  const mockPrepare = vi.fn();
  const mockRun = vi.fn();
  const mockGet = vi.fn();
  mockPrepare.mockReturnValue({ run: mockRun, get: mockGet });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet };
}

describe('PatientModel', () => {
  let model: PatientModel;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
    model = new PatientModel(db as any);
  });

  it('should create a patient', async () => {
    db._run.mockReturnValue({ changes: 1 });
    const data = { firstName: 'Ana', lastName: 'Pérez', clinicalHistoryNumber: 'HC-001', documentType: 'Cédula', documentNumber: '1001', birthDate: '1990-01-01' };

    const result = await model.create(data);

    expect(result.id).toBeDefined();
    expect(result.firstName).toBe('Ana');
    expect(db._run).toHaveBeenCalled();
  });

  it('should find by clinical history number', async () => {
    const mockPatient = { id: 'p1', firstName: 'Ana', lastName: 'Pérez', clinicalHistoryNumber: 'HC-001' };
    db._get.mockReturnValue(mockPatient);

    const result = await model.findByClinicalHistoryNumber('HC-001');

    expect(result).toEqual(mockPatient);
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
  });

  it('should return null when patient not found', async () => {
    db._get.mockReturnValue(undefined);

    const result = await model.findByClinicalHistoryNumber('NONEXISTENT');

    expect(result).toBeNull();
  });
});
