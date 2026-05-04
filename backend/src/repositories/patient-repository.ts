import { Patient } from '../models';
import { PatientModel } from '../models/patient';

export class PatientRepository {
  constructor(private patientModel: PatientModel) {}

  async create(patient: Omit<Patient, 'id'>): Promise<Patient> {
    return this.patientModel.create(patient);
  }

  async findById(id: string): Promise<Patient | null> {
    return this.patientModel.findById(id);
  }

  async findByClinicalHistoryNumber(clinicalHistoryNumber: string): Promise<Patient | null> {
    return this.patientModel.findByClinicalHistoryNumber(clinicalHistoryNumber);
  }
}