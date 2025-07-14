import { z } from 'zod';

export const deleteProjectSchema = z.object({
	projectId: z.string().min(1, 'Project ID is required')
});

export type DeleteProjectSchema = typeof deleteProjectSchema;

export const deleteTaskSchema = z.object({
	taskId: z.string().min(1, 'Task ID is required')
});

export type DeleteTaskSchema = typeof deleteTaskSchema;
