import { Patient, PatientModel } from '../models/patient';

export class PatientRepository {
  constructor(private patientModel: PatientModel) {}

  async findByClinicalHistoryNumber(clinicalHistoryNumber: string): Promise<Patient | null> {
    return this.patientModel.findByClinicalHistoryNumber(clinicalHistoryNumber);
  }

  async create(data: Omit<Patient, 'id'>): Promise<Patient> {
    return this.patientModel.create(data);
  }
}
