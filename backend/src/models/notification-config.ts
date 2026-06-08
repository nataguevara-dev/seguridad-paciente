import type Database from 'better-sqlite3';

export interface NotificationConfig {
  supervisorEmail: string;
}

export class NotificationConfigModel {
  constructor(private db: Database) {}

  async get(): Promise<NotificationConfig> {
    const row = this.db.prepare('SELECT * FROM notification_configs LIMIT 1').get();
    return row as NotificationConfig;
  }

  async update(supervisorEmail: string): Promise<void> {
    this.db.prepare('UPDATE notification_configs SET supervisorEmail = ?').run(supervisorEmail);
  }
}
