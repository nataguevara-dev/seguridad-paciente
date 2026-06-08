import { SafetyEvent } from '../models';
import { NotificationConfigModel } from '../models/notification-config';
import { config } from '../config';

import nodemailer from 'nodemailer';

export interface NotificationResult {
  success: boolean;
  message: string;
}

export class NotificationService {
  constructor(private notificationConfigModel: NotificationConfigModel) {}

  private async createTransport() {
    // If simulateEmail is enabled, use MailHog SMTP settings
    if (config.simulateEmail || config.mailTransport === 'mailhog') {
      return nodemailer.createTransport({
        host: config.mailhogHost,
        port: config.mailhogSmtpPort,
        secure: false
      });
    }

    // If SMTP_URL is provided, use it (not set by default in prototype)
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: (process.env.SMTP_SECURE || 'false') === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined
      });
    }

    // Fallback: no transport (will log instead)
    return null;
  }

  async sendSupervisorNotification(event: SafetyEvent): Promise<NotificationResult> {
    try {
      const cfg = await this.notificationConfigModel.get();

      const transport = await this.createTransport();

      const subject = 'New Patient Safety Event Reported';
      const body = `Event ID: ${event.id}\nReporter: ${event.reporterId}\nPatient: ${event.patientId}\nService: ${event.service}\nLocation: ${event.location}\nOccurred At: ${event.occurredAt}\n\nDescription:\n${event.description}`;

      if (transport) {
        await transport.sendMail({
          from: process.env.FROM_EMAIL || 'no-reply@example.com',
          to: cfg.supervisorEmail || config.supervisorEmail,
          subject,
          text: body
        });

        return { success: true, message: 'Notification sent via SMTP' };
      }

      // Fallback: log the notification (no external delivery)
      console.log(`[NOTIFICATION] (LOG) To: ${cfg.supervisorEmail || config.supervisorEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(body);

      return { success: true, message: 'Notification logged (no SMTP configured)' };
    } catch (error) {
      console.error('[NOTIFICATION ERROR]', error);
      return {
        success: false,
        message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async updateSupervisorEmail(email: string): Promise<void> {
    await this.notificationConfigModel.update(email);
  }

  async getSupervisorEmail(): Promise<string> {
    const cfg = await this.notificationConfigModel.get();
    return cfg.supervisorEmail;
  }
}