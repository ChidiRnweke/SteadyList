import { json } from '@sveltejs/kit';
import { updateTask } from '$lib/tasks';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, params }) => {
	try {
		const body = await request.json();
		const { status } = body;

		if (!status) {
			return json(
				{
					success: false,
					message: 'Status is required'
				},
				{ status: 400 }
			);
		}

		if (!['todo', 'in-progress', 'blocked', 'done'].includes(status)) {
			return json(
				{
					success: false,
					message: 'Invalid status value'
				},
				{ status: 400 }
			);
		}

		const result = await updateTask(params.id, { status });

		if (!result) {
			return json(
				{
					success: false,
					message: 'Task not found or failed to update'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			message: `Task status updated to ${status.replace('-', ' ')}`,
			task: result
		});
	} catch (error) {
		console.error('Error updating task status:', error);
		return json(
			{
				success: false,
				message: 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
