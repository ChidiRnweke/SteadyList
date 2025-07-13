import type { Notification } from './types';
import prisma from './prisma';

// Interface for the notification input
interface NotificationInput {
	title: string;
	message: string;
	taskId: string;
	projectId: string;
}

// Get all notifications for a user
export async function getNotifications(): Promise<Notification[]> {
	const notifications = await prisma.notification.findMany({
		orderBy: { createdAt: 'desc' }
	});

	return notifications.map((notification) => ({
		...notification,
		createdAt: notification.createdAt.toISOString()
	}));
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<boolean> {
	const notification = await prisma.notification.findUnique({
		where: { id }
	});

	if (!notification) {
		return false;
	}

	await prisma.notification.update({
		where: { id },
		data: { read: true }
	});

	return true;
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<boolean> {
	await prisma.notification.updateMany({
		where: { read: false },
		data: { read: true }
	});

	return true;
}

// Create a notification
export async function createNotification(data: NotificationInput): Promise<Notification> {
	const newNotification = await prisma.notification.create({
		data: {
			title: data.title,
			message: data.message,
			taskId: data.taskId,
			projectId: data.projectId,
			userId: 'user-1', // Mock user ID, will be replaced with actual auth
			read: false
		}
	});

	return {
		...newNotification,
		createdAt: newNotification.createdAt.toISOString()
	};
}

// Delete a notification
export async function deleteNotification(id: string): Promise<boolean> {
	const notification = await prisma.notification.findUnique({
		where: { id }
	});

	if (!notification) {
		return false;
	}

	await prisma.notification.delete({
		where: { id }
	});

	return true;
}
