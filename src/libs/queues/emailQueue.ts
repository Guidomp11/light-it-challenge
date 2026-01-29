import Queue from 'bull';
import { env } from '../../config/env';
import { NotificationFactory, NotificationTypes } from '../notifications/notification.factory';

interface EmailJobData {
  email: string;
  patientName: string;
  message: string;
}

// Create email queue
export const emailQueue = new Queue<EmailJobData>('emails', {
  redis: {
    host: env.redis?.host || 'localhost',
    port: env.redis?.port || 6379,
  },
});

// Process email jobs
emailQueue.process(async (job) => {
  const { email, patientName, message } = job.data;

  try {
    const mailNotification = NotificationFactory.getNotificationService(NotificationTypes.MAIL);
    
    // Update email message with recipient
    const fullMessage = `${message}\n\nRecipient: ${email}`;
    
    await mailNotification.sendNotification(email, fullMessage);
    
    console.log(`✉️  Email sent successfully to ${email} (${patientName})`);
    return { success: true, email };
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error);
    throw error; // Bull will retry automatically
  }
});

// Event listeners for queue
emailQueue.on('completed', (job) => {
  console.log(`📧 Job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed after retries:`, err.message);
});

emailQueue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

export async function addEmailToQueue(
  email: string,
  patientName: string,
  message: string
): Promise<void> {
  try {
    const job = await emailQueue.add(
      { email, patientName, message },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      }
    );
    console.log(`📌 Email job queued with ID: ${job.id}`);
    return;
  } catch (error) {
    console.error('Error adding email to queue:', error);
    throw error;
  }
}
