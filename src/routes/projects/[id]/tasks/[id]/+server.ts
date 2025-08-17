import { error, json } from '@sveltejs/kit';
import { createServices } from '$lib';
import type { RequestHandler } from './$types';
import type { UpdateTaskInput } from '$lib/types';
import { updateTaskSchema } from '$lib/schemas/task-schema';
import type { AuthenticatedUser } from '$lib/server/auth';

export const PUT: RequestHandler = async ({ request, params, locals }) => {
	try {
		const user: AuthenticatedUser | null = locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const body = await request.json();

		// Validate request body using Zod
		const validationResult = updateTaskSchema.safeParse(body);

		if (!validationResult.success) {
			return json(
				{
					success: false,
					message: 'Validation failed',
					errors: validationResult.error.errors.map((err) => ({
						field: err.path.join('.'),
						message: err.message
					}))
				},
				{ status: 422 }
			);
		}

		const validatedData = validationResult.data;

		// Check if at least one field is provided for update
		if (Object.keys(validatedData).length === 0) {
			return json(
				{
					success: false,
					message: 'No valid fields provided for update'
				},
				{ status: 422 }
			);
		}

		// Convert validated data to UpdateTaskInput format
		const updateData: UpdateTaskInput = {};
		if (validatedData.status !== undefined) updateData.status = validatedData.status;
		if (validatedData.title !== undefined) updateData.title = validatedData.title;
		if (validatedData.description !== undefined)
			updateData.description = validatedData.description || undefined;
		if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
		if (validatedData.dueDate !== undefined) updateData.dueDate = validatedData.dueDate;
		if (validatedData.reminder !== undefined) updateData.reminder = validatedData.reminder;

		const result = await services.tasks.updateTask(params.id, updateData);

		if (!result) {
			return json(
				{
					success: false,
					message: 'Task not found or failed to update'
				},
				{ status: 404 }
			);
		}

		// Generate appropriate success message
		let message = 'Task updated successfully';
		if (validatedData.status)
			message = `Task status updated to ${validatedData.status.replace('-', ' ')}`;
		else if (validatedData.title) message = 'Task title updated';
		else if (validatedData.description !== undefined) message = 'Task description updated';
		else if (validatedData.priority) message = 'Task priority updated';

		return json({
			success: true,
			message,
			task: result
		});
	} catch (error) {
		console.error('Error updating task:', error);
		return json(
			{
				success: false,
				message: 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
