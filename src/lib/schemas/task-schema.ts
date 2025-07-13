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

// Schema for updating tasks - all fields are optional but with same validation rules
export const updateTaskSchema = z.object({
	title: z
		.string()
		.min(1, 'Task title is required')
		.max(100, 'Task title must be 100 characters or less')
		.optional(),
	description: z
		.string()
		.max(500, 'Description must be 500 characters or less')
		.nullable()
		.optional(),
	dueDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
	priority: z.enum(['low', 'medium', 'high']).optional(),
	status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
	reminder: z.boolean().optional()
});

export type TaskSchema = typeof taskSchema;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
