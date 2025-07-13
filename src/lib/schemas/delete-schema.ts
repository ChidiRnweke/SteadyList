import { z } from 'zod';

export const deleteProjectSchema = z.object({
	projectId: z.string().min(1, 'Project ID is required')
});

export type DeleteProjectSchema = typeof deleteProjectSchema;
