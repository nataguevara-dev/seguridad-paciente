import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface SafetyEvent {
  id: string;
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  reporterId: string;
  service: string;
  location: string;
  occurredAt: string;
  description: string;
  notificationStatus: string;
  notificationError?: string | null;
  createdAt: string;
  clinicalHistoryNumber?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
}

export interface EventFilters {
  month?: number;
  year?: number;
  patientName?: string;
  clinicalHistoryNumber?: string;
  service?: string;
}

export interface PaginatedResponse {
  events: SafetyEvent[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'http://localhost:3000/api/events';

  constructor(private authService: AuthService) {}

  async getEvents(limit: number = 10): Promise<SafetyEvent[]> {
    const token = this.authService.getToken();
    const response = await fetch(`${this.apiUrl}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    return data.data.events as SafetyEvent[];
  }

  async getFilteredEvents(filters: EventFilters, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse> {
    const token = this.authService.getToken();
    const queryParts: string[] = [`page=${page}`, `pageSize=${pageSize}`];

    if (filters.month !== undefined) queryParts.push(`month=${filters.month}`);
    if (filters.year !== undefined) queryParts.push(`year=${filters.year}`);
    if (filters.patientName) queryParts.push(`patientName=${encodeURIComponent(filters.patientName)}`);
    if (filters.clinicalHistoryNumber) queryParts.push(`clinicalHistoryNumber=${encodeURIComponent(filters.clinicalHistoryNumber)}`);
    if (filters.service) queryParts.push(`service=${encodeURIComponent(filters.service)}`);

    const response = await fetch(`${this.apiUrl}?${queryParts.join('&')}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch filtered events');
    }

    const data = await response.json();
    return {
      events: data.data.events as SafetyEvent[],
      pagination: data.data.pagination
    };
  }
}
