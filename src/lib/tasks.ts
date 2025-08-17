import type { Task, CreateTaskInput, UpdateTaskInput } from './types';
import { NotificationsService } from './notifications';
import type { INotificationsService } from './notifications';
import prisma from './prisma';

export interface ITasksService {
	getAllTasks(): Promise<Task[]>;
	getTasksByProject(projectId: string): Promise<Task[]>;
	getTaskById(id: string): Promise<Task | null>;
	createTask(data: CreateTaskInput): Promise<Task>;
	updateTask(id: string, data: UpdateTaskInput): Promise<Task | null>;
	updateTaskStatus(id: string, status: string): Promise<Task | null>;
	softDeleteTask(id: string): Promise<boolean>;
	restoreTask(id: string): Promise<boolean>;
	getDeletedTasks(): Promise<(Task & { projectName: string; projectDeleted: boolean })[]>;
	deleteTask(id: string): Promise<boolean>;
}

export class TasksService implements ITasksService {
	private notifications: INotificationsService;

	constructor(private userId: string) {
		this.notifications = new NotificationsService(userId);
	}

	async getAllTasks(): Promise<Task[]> {
		const tasks = await prisma.task.findMany({
			where: { deleted: false, userId: this.userId },
			orderBy: { updatedAt: 'desc' }
		});

		return tasks.map((task) => ({
			...task,
			description: task.description || undefined,
			priority: task.priority as 'low' | 'medium' | 'high',
			createdAt: task.createdAt.toISOString(),
			updatedAt: task.updatedAt.toISOString(),
			dueDate: task.dueDate?.toISOString() || undefined,
			status: task.status as 'todo' | 'in-progress' | 'blocked' | 'done'
		}));
	}

	async getTasksByProject(projectId: string): Promise<Task[]> {
		const tasks = await prisma.task.findMany({
			where: { projectId, deleted: false, userId: this.userId },
			orderBy: { updatedAt: 'desc' }
		});

		return tasks.map((task) => ({
			...task,
			description: task.description || undefined,
			priority: task.priority as 'low' | 'medium' | 'high',
			createdAt: task.createdAt.toISOString(),
			updatedAt: task.updatedAt.toISOString(),
			dueDate: task.dueDate?.toISOString() || undefined,
			status: task.status as 'todo' | 'in-progress' | 'blocked' | 'done'
		}));
	}

	async getTaskById(id: string): Promise<Task | null> {
		const task = await prisma.task.findFirst({ where: { id, userId: this.userId } });

		if (!task) return null;

		return {
			...task,
			description: task.description || undefined,
			priority: task.priority as 'low' | 'medium' | 'high',
			createdAt: task.createdAt.toISOString(),
			updatedAt: task.updatedAt.toISOString(),
			dueDate: task.dueDate?.toISOString() || undefined,
			status: task.status as 'todo' | 'in-progress' | 'blocked' | 'done'
		};
	}

	async createTask(data: CreateTaskInput): Promise<Task> {
		const newTask = await prisma.task.create({
			data: {
				title: data.title,
				description: data.description || '',
				dueDate: data.dueDate,
				priority: data.priority,
				status: data.status,
				reminder: data.reminder || false,
				projectId: data.projectId,
				userId: this.userId,
				deleted: false
			}
		});

		if (newTask.dueDate && newTask.reminder) {
			const dueDate = new Date(newTask.dueDate);
			const now = new Date();

			if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
				await this.notifications.createNotification({
					title: 'Task Due Soon',
					message: `Task "${newTask.title}" is due soon.`,
					taskId: newTask.id,
					projectId: newTask.projectId
				});
			}
		}

		return {
			...newTask,
			createdAt: newTask.createdAt.toISOString(),
			updatedAt: newTask.updatedAt.toISOString(),
			dueDate: newTask.dueDate?.toISOString() || undefined,
			status: newTask.status as 'todo' | 'in-progress' | 'blocked' | 'done',
			description: newTask.description || undefined,
			priority: newTask.priority as 'low' | 'medium' | 'high'
		};
	}

	async updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
		const task = await prisma.task.findFirst({ where: { id, userId: this.userId } });

		if (!task) {
			return null;
		}

		const updatedTask = await prisma.task.update({
			where: { id },
			data: {
				title: data.title,
				description: data.description,
				dueDate: data.dueDate,
				priority: data.priority,
				status: data.status,
				reminder: data.reminder,
				projectId: data.projectId
			}
		});

		if (updatedTask.dueDate && updatedTask.reminder) {
			const dueDate = new Date(updatedTask.dueDate);
			const now = new Date();

			if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
				await this.notifications.createNotification({
					title: 'Task Due Soon',
					message: `Task "${updatedTask.title}" is due soon.`,
					taskId: updatedTask.id,
					projectId: updatedTask.projectId
				});
			}
		}

		return {
			...updatedTask,
			createdAt: updatedTask.createdAt.toISOString(),
			updatedAt: updatedTask.updatedAt.toISOString(),
			dueDate: updatedTask.dueDate?.toISOString() || undefined,
			status: updatedTask.status as 'todo' | 'in-progress' | 'blocked' | 'done',
			description: updatedTask.description || undefined,
			priority: updatedTask.priority as 'low' | 'medium' | 'high'
		};
	}

	async updateTaskStatus(id: string, status: string): Promise<Task | null> {
		const task = await prisma.task.findFirst({ where: { id, userId: this.userId } });

		if (!task) {
			return null;
		}

		const updatedTask = await prisma.task.update({ where: { id }, data: { status } });

		return {
			...updatedTask,
			createdAt: updatedTask.createdAt.toISOString(),
			updatedAt: updatedTask.updatedAt.toISOString(),
			dueDate: updatedTask.dueDate?.toISOString() || undefined,
			status: updatedTask.status as 'todo' | 'in-progress' | 'blocked' | 'done',
			description: updatedTask.description || undefined,
			priority: updatedTask.priority as 'low' | 'medium' | 'high'
		};
	}

	async softDeleteTask(id: string): Promise<boolean> {
		const task = await prisma.task.findFirst({ where: { id, userId: this.userId } });

		if (!task) {
			return false;
		}

		await prisma.task.update({ where: { id }, data: { deleted: true } });

		return true;
	}

	async restoreTask(id: string): Promise<boolean> {
		const task = await prisma.task.findFirst({ where: { id, userId: this.userId } });

		if (!task) {
			return false;
		}

		await prisma.task.update({ where: { id }, data: { deleted: false } });

		return true;
	}

	async getDeletedTasks(): Promise<(Task & { projectName: string; projectDeleted: boolean })[]> {
		const tasks = await prisma.task.findMany({
			where: { deleted: true, userId: this.userId },
			orderBy: { updatedAt: 'desc' },
			include: {
				project: {
					select: {
						name: true,
						deleted: true
					}
				}
			}
		});

		return tasks.map((task) => ({
			...task,
			priority: task.priority as 'low' | 'medium' | 'high',
			status: task.status as 'todo' | 'in-progress' | 'blocked' | 'done',
			description: task.description || undefined,
			dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
			createdAt: task.createdAt.toISOString(),
			updatedAt: task.updatedAt.toISOString(),
			projectName: task.project.name,
			projectDeleted: task.project.deleted
		}));
	}

	async deleteTask(id: string): Promise<boolean> {
		try {
			const task = await prisma.task.findFirst({ where: { id, userId: this.userId } });

			if (!task) {
				return false;
			}

			await prisma.task.delete({ where: { id } });

			return true;
		} catch (error) {
			console.error('Error deleting task:', error);
			return false;
		}
	}
}
