import type Database from 'better-sqlite3';

export interface SafetyEvent {
  id: string;
  patientId: string;
  reporterId: string;
  service: string;
  location: string;
  occurredAt: string;
  description: string;
  notificationStatus: string;
  notificationError?: string | null;
  createdAt: string;
  patientFirstName?: string;
  patientLastName?: string;
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

export interface PaginatedResult {
  events: SafetyEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatisticsFilters {
  from?: string;
  to?: string;
}

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

export interface StatisticsResult {
  byService: ServiceStat[];
  monthlyHistogram: MonthlyStat[];
  byHour: HourStat[];
  topPatients: PatientStat[];
}

export class SafetyEventModel {
  constructor(private db: Database) {}

  async create(data: Omit<SafetyEvent, 'id' | 'notificationStatus' | 'createdAt'>): Promise<SafetyEvent> {
    const crypto = await import('crypto');
    const event: SafetyEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      notificationStatus: 'pending',
      notificationError: null,
      ...data
    };

    this.db.prepare(
      'INSERT INTO safety_events (id, patientId, reporterId, service, location, occurredAt, description, notificationStatus, notificationError, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      event.id,
      event.patientId,
      event.reporterId,
      event.service,
      event.location,
      event.occurredAt,
      event.description,
      event.notificationStatus,
      event.notificationError,
      event.createdAt
    );

    return event;
  }

  async findByReporterId(reporterId: string): Promise<SafetyEvent[]> {
    return this.db.prepare('SELECT * FROM safety_events WHERE reporterId = ?').all(reporterId);
  }

  async findRecent(limit: number = 10): Promise<SafetyEvent[]> {
    const rows = this.db.prepare(
      `SELECT se.*, p.firstName AS patientFirstName, p.lastName AS patientLastName,
              p.clinicalHistoryNumber, p.documentType, p.documentNumber, p.birthDate
       FROM safety_events se
       JOIN patients p ON se.patientId = p.id
       ORDER BY se.createdAt DESC
       LIMIT ?`
    ).all(limit);
    return rows as SafetyEvent[];
  }

  async findFiltered(filters: EventFilters, page: number = 1, pageSize: number = 20): Promise<PaginatedResult> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.month !== undefined) {
      conditions.push("CAST(strftime('%m', se.createdAt) AS INTEGER) = ?");
      params.push(filters.month);
    }

    if (filters.year !== undefined) {
      conditions.push("CAST(strftime('%Y', se.createdAt) AS INTEGER) = ?");
      params.push(filters.year);
    }

    if (filters.patientName) {
      conditions.push("(p.firstName || ' ' || p.lastName LIKE ?)");
      params.push(`%${filters.patientName}%`);
    }

    if (filters.clinicalHistoryNumber) {
      conditions.push('p.clinicalHistoryNumber = ?');
      params.push(filters.clinicalHistoryNumber);
    }

    if (filters.service) {
      conditions.push('se.service = ?');
      params.push(filters.service);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const baseQuery = `FROM safety_events se JOIN patients p ON se.patientId = p.id ${whereClause}`;

    const countRow = this.db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params) as { count: number };
    const total = countRow.count;

    const dataParams = [...params, pageSize, offset];
    const rows = this.db.prepare(
      `SELECT se.*, p.firstName AS patientFirstName, p.lastName AS patientLastName,
              p.clinicalHistoryNumber, p.documentType, p.documentNumber, p.birthDate
       ${baseQuery} ORDER BY se.createdAt DESC LIMIT ? OFFSET ?`
    ).all(...dataParams);

    return {
      events: rows as SafetyEvent[],
      total,
      page,
      pageSize,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 0
    };
  }

  async getStatistics(filters: StatisticsFilters): Promise<StatisticsResult> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.from) {
      conditions.push('se.createdAt >= ?');
      params.push(filters.from);
    }

    if (filters.to) {
      conditions.push('se.createdAt <= ?');
      params.push(filters.to + 'T23:59:59.999Z');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const byService = this.db.prepare(
      `SELECT se.service, COUNT(*) as count
       FROM safety_events se ${whereClause}
       GROUP BY se.service ORDER BY count DESC`
    ).all(...params) as ServiceStat[];

    const monthlyHistogram = this.db.prepare(
      `SELECT CAST(strftime('%m', se.createdAt) AS INTEGER) as month,
              CAST(strftime('%Y', se.createdAt) AS INTEGER) as year,
              COUNT(*) as count
       FROM safety_events se ${whereClause}
       GROUP BY year, month ORDER BY year, month`
    ).all(...params) as MonthlyStat[];

    const byHour = this.db.prepare(
      `SELECT CAST(strftime('%H', se.occurredAt) AS INTEGER) as hour,
              COUNT(*) as count
       FROM safety_events se ${whereClause}
       GROUP BY hour ORDER BY hour`
    ).all(...params) as HourStat[];

    const rawTopPatients = this.db.prepare(
      `SELECT se.patientId,
              p.firstName || ' ' || p.lastName as patientName,
              COUNT(*) as eventCount
       FROM safety_events se
       JOIN patients p ON se.patientId = p.id ${whereClause}
       GROUP BY se.patientId, patientName
       ORDER BY eventCount DESC LIMIT 11`
    ).all(...params) as PatientStat[];

    let topPatients = rawTopPatients.slice(0, 10);
    if (rawTopPatients.length > 10) {
      const tenthCount = topPatients[9]?.eventCount ?? 0;
      for (let i = 10; i < rawTopPatients.length; i++) {
        if (rawTopPatients[i].eventCount === tenthCount) {
          topPatients.push(rawTopPatients[i]);
        }
      }
    }

    return { byService, monthlyHistogram, byHour, topPatients };
  }

  async updateNotificationStatus(eventId: string, status: string, errorMessage?: string | null): Promise<void> {
    this.db.prepare(
      'UPDATE safety_events SET notificationStatus = ?, notificationError = ? WHERE id = ?'
    ).run(status, errorMessage ?? null, eventId);
  }
}
