import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface ServiceStat {
  service: string;
  count: number;
}

export interface MonthlyStat {
  month: number;
  year: number;
  count: number;
}

export interface HourStat {
  hour: number;
  count: number;
}

export interface PatientStat {
  patientId: string;
  patientName: string;
  eventCount: number;
}

export interface StatisticsData {
  byService: ServiceStat[];
  monthlyHistogram: MonthlyStat[];
  byHour: HourStat[];
  topPatients: PatientStat[];
}

export interface StatsFilters {
  from?: string;
  to?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:3000/api/events/stats';

  constructor(private authService: AuthService) {}

  async getStatistics(filters?: StatsFilters): Promise<StatisticsData> {
    const token = this.authService.getToken();
    const queryParts: string[] = [];

    if (filters?.from) queryParts.push(`from=${encodeURIComponent(filters.from)}`);
    if (filters?.to) queryParts.push(`to=${encodeURIComponent(filters.to)}`);

    const url = queryParts.length > 0 ? `${this.apiUrl}?${queryParts.join('&')}` : this.apiUrl;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch statistics');
    }

    const data = await response.json();
    return data.data as StatisticsData;
  }
}
