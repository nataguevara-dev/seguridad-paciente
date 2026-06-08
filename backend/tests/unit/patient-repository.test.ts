import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientRepository } from '../../src/repositories/patient-repository';
import { PatientModel } from '../../src/models/patient';

describe('PatientRepository', () => {
  let repository: PatientRepository;
  let mockModel: Partial<PatientModel>;

  const mockPatient = {
    id: 'p1', firstName: 'Ana', lastName: 'Pérez',
    clinicalHistoryNumber: 'HC-001', documentType: 'Cédula',
    documentNumber: '1001', birthDate: '1990-01-01'
  };

  beforeEach(() => {
    mockModel = {
      create: vi.fn().mockResolvedValue(mockPatient),
      findByClinicalHistoryNumber: vi.fn().mockResolvedValue(mockPatient)
    };
    repository = new PatientRepository(mockModel as PatientModel);
  });

  it('should delegate create', async () => {
    const data = { firstName: 'Ana', lastName: 'Pérez', clinicalHistoryNumber: 'HC-001', documentType: 'Cédula', documentNumber: '1001', birthDate: '1990-01-01' };
    const result = await repository.create(data);
    expect(result).toEqual(mockPatient);
    expect(mockModel.create).toHaveBeenCalledWith(data);
  });

  it('should delegate findByClinicalHistoryNumber', async () => {
    const result = await repository.findByClinicalHistoryNumber('HC-001');
    expect(result).toEqual(mockPatient);
    expect(mockModel.findByClinicalHistoryNumber).toHaveBeenCalledWith('HC-001');
  });
});
