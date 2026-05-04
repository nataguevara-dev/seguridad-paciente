import { SafetyEvent } from '../models';
import { NotificationConfigModel } from '../models/notification-config';
import { config } from '../config';

export interface NotificationResult {
  success: boolean;
  message: string;
}

export class NotificationService {
  constructor(private notificationConfigModel: NotificationConfigModel) {}

  async sendSupervisorNotification(event: SafetyEvent): Promise<NotificationResult> {
    try {
      const config = await this.notificationConfigModel.get();

      // In a real implementation, this would send an actual email
      // For prototype, we'll just log the notification
      console.log(`[NOTIFICATION] Sending email to supervisor ${config.supervisorEmail}`);
      console.log(`Subject: New Patient Safety Event Reported`);
      console.log(`Event ID: ${event.id}`);
      console.log(`Reporter: ${event.reporterId}`);
      console.log(`Patient: ${event.patientId}`);
      console.log(`Service: ${event.service}`);
      console.log(`Location: ${event.location}`);
      console.log(`Description: ${event.description}`);
      console.log(`Occurred At: ${event.occurredAt}`);

      // Simulate async email sending
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        message: 'Notification sent successfully'
      };
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
    const config = await this.notificationConfigModel.get();
    return config.supervisorEmail;
  }
}