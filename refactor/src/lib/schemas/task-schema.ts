import { z } from 'zod';

export const taskSchema = z.object({
	title: z
		.string()
		.min(1, 'Task title is required')
		.max(100, 'Task title must be 100 characters or less'),
	description: z.string().max(500, 'Description must be 500 characters or less').optional(),
	dueDate: z.date().optional(),
	priority: z.enum(['low', 'medium', 'high']),
	status: z.enum(['todo', 'in-progress', 'blocked', 'done']),
	reminder: z.boolean().default(false)
});

export type TaskSchema = typeof taskSchema;
