import { MailNotification } from './mail.notification';

export enum NotificationTypes {
  MAIL = 'mail',
  SMS = 'sms',
}

export class NotificationFactory {
  public static getNotificationService(type: NotificationTypes) {
    switch (type) {
      case NotificationTypes.MAIL:
        return new MailNotification();
      case NotificationTypes.SMS:
        // return new SmsNotification();
        throw new Error('SMS notification not implemented yet.');
      default:
        throw new Error(`Notification type ${type} not supported.`);
    }
  }
}