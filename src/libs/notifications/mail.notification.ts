import { transporter } from '../../config/nodemailer';
import { NotificationService } from "./notification";

class MailNotification extends NotificationService {
  async sendNotification(to: string, message: string): Promise<void> {
    try {
      const info = await transporter.sendMail({
        from: '"Light-it" <no-reply@lightit.com>',
        to,
        subject: 'Confirmation Email',
        html: message,
      });

      console.log("Email sent successfully", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export { MailNotification };
