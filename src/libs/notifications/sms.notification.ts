import { NotificationService } from './notification';

class SmsNotification extends NotificationService {
  async sendNotification(message: string): Promise<void> {
    console.info(`SMS sent with message: ${message}`);
  }
}

export { SmsNotification };