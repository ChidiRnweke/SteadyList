import type { Task, CreateTaskInput, UpdateTaskInput } from './types';
import { createNotification } from './notifications';
import prisma from './prisma';

// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
	const tasks = await prisma.task.findMany({
		where: { deleted: false },
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

// Get tasks by project ID
export async function getTasksByProject(projectId: string): Promise<Task[]> {
	const tasks = await prisma.task.findMany({
		where: {
			projectId,
			deleted: false
		},
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

// Get task by ID
export async function getTaskById(id: string): Promise<Task | null> {
	const task = await prisma.task.findUnique({
		where: { id }
	});

	return task as Task | null;
}

// Create a new task
export async function createTask(data: CreateTaskInput): Promise<Task> {
	const newTask = await prisma.task.create({
		data: {
			title: data.title,
			description: data.description || '',
			dueDate: data.dueDate,
			priority: data.priority,
			status: data.status,
			reminder: data.reminder || false,
			projectId: data.projectId,
			userId: 'user-1', // Mock user ID, will be replaced with actual auth
			deleted: false
		}
	});

	// Create a notification if the task has a due date and reminder is set
	if (newTask.dueDate && newTask.reminder) {
		const dueDate = new Date(newTask.dueDate);
		const now = new Date();

		// If due date is within the next 24 hours, create a notification
		if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
			await createNotification({
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

// Update a task
export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
	const task = await prisma.task.findUnique({
		where: { id }
	});

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

	// Create a notification if the task has a due date and reminder is set
	if (updatedTask.dueDate && updatedTask.reminder) {
		const dueDate = new Date(updatedTask.dueDate);
		const now = new Date();

		// If due date is within the next 24 hours, create a notification
		if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
			await createNotification({
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

// Update task status
export async function updateTaskStatus(id: string, status: string): Promise<Task | null> {
	const task = await prisma.task.findUnique({
		where: { id }
	});

	if (!task) {
		return null;
	}

	const updatedTask = await prisma.task.update({
		where: { id },
		data: { status }
	});

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

// Soft delete a task
export async function softDeleteTask(id: string): Promise<boolean> {
	const task = await prisma.task.findUnique({
		where: { id }
	});

	if (!task) {
		return false;
	}

	await prisma.task.update({
		where: { id },
		data: { deleted: true }
	});

	return true;
}

// Restore a soft-deleted task
export async function restoreTask(id: string): Promise<boolean> {
	const task = await prisma.task.findUnique({
		where: { id }
	});

	if (!task) {
		return false;
	}

	await prisma.task.update({
		where: { id },
		data: { deleted: false }
	});

	return true;
}

// Get all deleted tasks
export async function getDeletedTasks(): Promise<
	(Task & { projectName: string; projectDeleted: boolean })[]
> {
	const tasks = await prisma.task.findMany({
		where: { deleted: true },
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
