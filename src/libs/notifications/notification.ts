abstract class NotificationService {
    abstract sendNotification(to: string, message: string): Promise<void>;
}

export { NotificationService };