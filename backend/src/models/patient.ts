import type Database from 'better-sqlite3';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  clinicalHistoryNumber: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
}

export class PatientModel {
  constructor(private db: Database) {}

  async findByClinicalHistoryNumber(clinicalHistoryNumber: string): Promise<Patient | null> {
    const row = this.db.prepare('SELECT * FROM patients WHERE clinicalHistoryNumber = ?').get(clinicalHistoryNumber);
    return row ?? null;
  }

  async create(data: Omit<Patient, 'id'>): Promise<Patient> {
    const crypto = await import('crypto');
    const patient: Patient = {
      id: crypto.randomUUID(),
      ...data
    };

    this.db.prepare(
      'INSERT INTO patients (id, firstName, lastName, clinicalHistoryNumber, documentType, documentNumber, birthDate) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      patient.id,
      patient.firstName,
      patient.lastName,
      patient.clinicalHistoryNumber,
      patient.documentType,
      patient.documentNumber,
      patient.birthDate
    );

    return patient;
  }
}
