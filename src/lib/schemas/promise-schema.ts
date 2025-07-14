import { z } from 'zod';

export const promiseMadeSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
	promiseTo: z.string().max(100, 'Person name must be less than 100 characters').optional(),
	dueDate: z.string().optional()
});

export const updatePromiseMadeSchema = z.object({
	id: z.string().min(1, 'Promise ID is required'),
	title: z
		.string()
		.min(1, 'Title is required')
		.max(255, 'Title must be less than 255 characters')
		.optional(),
	promiseTo: z.string().max(100, 'Person name must be less than 100 characters').optional(),
	dueDate: z.string().optional(),
	completed: z.boolean().optional()
});

export type PromiseMadeSchema = typeof promiseMadeSchema;
export type UpdatePromiseMadeSchema = typeof updatePromiseMadeSchema;
