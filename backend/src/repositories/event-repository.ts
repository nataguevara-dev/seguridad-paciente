import { SafetyEvent } from '../models';
import { SafetyEventModel } from '../models/safety-event';

export class EventRepository {
  constructor(private eventModel: SafetyEventModel) {}

  async create(event: Omit<SafetyEvent, 'id' | 'createdAt' | 'notificationStatus' | 'notificationError'>): Promise<SafetyEvent> {
    return this.eventModel.create(event);
  }

  async findById(id: string): Promise<SafetyEvent | null> {
    return this.eventModel.findById(id);
  }

  async findByReporterId(reporterId: string): Promise<SafetyEvent[]> {
    return this.eventModel.findByReporterId(reporterId);
  }

  async updateNotificationStatus(id: string, status: 'pending' | 'sent' | 'failed', error?: string): Promise<void> {
    return this.eventModel.updateNotificationStatus(id, status, error);
  }
}