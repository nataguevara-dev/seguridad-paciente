import { SafetyEvent, SafetyEventModel, EventFilters, PaginatedResult, StatisticsFilters, StatisticsResult } from '../models/safety-event';

export class EventRepository {
  constructor(private eventModel: SafetyEventModel) {}

  async create(data: Omit<SafetyEvent, 'id' | 'notificationStatus' | 'notificationError' | 'createdAt'>): Promise<SafetyEvent> {
    return this.eventModel.create(data);
  }

  async findByReporterId(reporterId: string): Promise<SafetyEvent[]> {
    return this.eventModel.findByReporterId(reporterId);
  }

  async findRecent(limit: number = 10): Promise<SafetyEvent[]> {
    return this.eventModel.findRecent(limit);
  }

  async findFiltered(filters: EventFilters, page: number = 1, pageSize: number = 20): Promise<PaginatedResult> {
    return this.eventModel.findFiltered(filters, page, pageSize);
  }

  async getStatistics(filters: StatisticsFilters): Promise<StatisticsResult> {
    return this.eventModel.getStatistics(filters);
  }

  async updateNotificationStatus(eventId: string, status: string, errorMessage?: string | null): Promise<void> {
    return this.eventModel.updateNotificationStatus(eventId, status, errorMessage);
  }
}
