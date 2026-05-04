import { SafetyEvent, Patient } from '../models';
import { EventRepository } from '../repositories/event-repository';
import { PatientRepository } from '../repositories/patient-repository';
import { NotificationService } from '../services/notification-service';
import { validateRequired, validateStringLength, combineValidations, ValidationError } from '../shared/validation';

export interface CreateEventData {
  patient: {
    firstName: string;
    lastName: string;
    clinicalHistoryNumber: string;
    documentType: string;
    documentNumber: string;
    birthDate: string;
  };
  service: string;
  location: string;
  occurredAt: string;
  description: string;
}

export class EventService {
  constructor(
    private eventRepository: EventRepository,
    private patientRepository: PatientRepository,
    private notificationService: NotificationService
  ) {}

  async createEvent(data: CreateEventData, reporterId: string): Promise<SafetyEvent> {
    // Validate input
    const validations = [
      validateRequired(data.patient.firstName, 'patient.firstName'),
      validateRequired(data.patient.lastName, 'patient.lastName'),
      validateRequired(data.patient.clinicalHistoryNumber, 'patient.clinicalHistoryNumber'),
      validateRequired(data.patient.documentType, 'patient.documentType'),
      validateRequired(data.patient.documentNumber, 'patient.documentNumber'),
      validateRequired(data.patient.birthDate, 'patient.birthDate'),
      validateRequired(data.service, 'service'),
      validateRequired(data.location, 'location'),
      validateRequired(data.occurredAt, 'occurredAt'),
      validateStringLength(data.description, 'description', 10, 1000)
    ];

    const validation = combineValidations(...validations);
    if (!validation.isValid) {
      throw new ValidationError(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if patient exists by clinical history number, create if not
    let patient = await this.patientRepository.findByClinicalHistoryNumber(data.patient.clinicalHistoryNumber);
    if (!patient) {
      patient = await this.patientRepository.create(data.patient);
    }

    // Create the event
    const event = await this.eventRepository.create({
      patientId: patient.id,
      reporterId,
      service: data.service,
      location: data.location,
      occurredAt: data.occurredAt,
      description: data.description
    });

    // Send notification asynchronously (don't wait for it)
    this.sendNotification(event).catch(error => {
      console.error('Failed to send notification:', error);
      // Update event status to failed
      this.eventRepository.updateNotificationStatus(event.id, 'failed', error.message);
    });

    return event;
  }

  async getEventsByReporter(reporterId: string): Promise<SafetyEvent[]> {
    return this.eventRepository.findByReporterId(reporterId);
  }

  private async sendNotification(event: SafetyEvent): Promise<void> {
    const result = await this.notificationService.sendSupervisorNotification(event);

    if (result.success) {
      await this.eventRepository.updateNotificationStatus(event.id, 'sent');
    } else {
      await this.eventRepository.updateNotificationStatus(event.id, 'failed', result.message);
    }
  }
}