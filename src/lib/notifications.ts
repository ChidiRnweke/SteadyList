import type { Notification } from './types';
import prisma from './prisma';

export interface NotificationInput {
	title: string;
	message: string;
	taskId: string;
	projectId: string;
}

export interface INotificationsService {
	getNotifications(): Promise<Notification[]>;
	markNotificationAsRead(id: string): Promise<boolean>;
	markAllNotificationsAsRead(): Promise<boolean>;
	createNotification(data: NotificationInput): Promise<Notification>;
	deleteNotification(id: string): Promise<boolean>;
}

export class NotificationsService implements INotificationsService {
	constructor(private userId: string) {}

	async getNotifications(): Promise<Notification[]> {
		const notifications = await prisma.notification.findMany({
			where: { userId: this.userId },
			orderBy: { createdAt: 'desc' }
		});

		return notifications.map((notification) => ({
			...notification,
			createdAt: notification.createdAt.toISOString()
		}));
	}

	async markNotificationAsRead(id: string): Promise<boolean> {
		const notification = await prisma.notification.findFirst({
			where: { id, userId: this.userId }
		});

		if (!notification) return false;

		await prisma.notification.update({ where: { id }, data: { read: true } });

		return true;
	}

	async markAllNotificationsAsRead(): Promise<boolean> {
		await prisma.notification.updateMany({
			where: { userId: this.userId, read: false },
			data: { read: true }
		});
		return true;
	}

	async createNotification(data: NotificationInput): Promise<Notification> {
		const newNotification = await prisma.notification.create({
			data: {
				title: data.title,
				message: data.message,
				taskId: data.taskId,
				projectId: data.projectId,
				userId: this.userId,
				read: false
			}
		});

		return {
			...newNotification,
			createdAt: newNotification.createdAt.toISOString()
		};
	}

	async deleteNotification(id: string): Promise<boolean> {
		const notification = await prisma.notification.findFirst({
			where: { id, userId: this.userId }
		});

		if (!notification) {
			return false;
		}

		await prisma.notification.delete({ where: { id } });

		return true;
	}
}

// Legacy function wrappers for backward compatibility (uses a default/mock user id)
const _defaultUserId_notifs = 'user-1';
const _notificationsService = new NotificationsService(_defaultUserId_notifs);

export const getNotifications = () => _notificationsService.getNotifications();
export const markNotificationAsRead = (id: string) =>
	_notificationsService.markNotificationAsRead(id);
export const markAllNotificationsAsRead = () => _notificationsService.markAllNotificationsAsRead();
export const createNotification = (data: NotificationInput) =>
	_notificationsService.createNotification(data);
export const deleteNotification = (id: string) => _notificationsService.deleteNotification(id);
