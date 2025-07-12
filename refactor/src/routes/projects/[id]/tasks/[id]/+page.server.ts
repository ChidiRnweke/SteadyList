import { softDeleteTask, updateTask } from '$lib/tasks';
import type { Actions } from './$types';

export const actions: Actions = {
	deleteTask: async ({ params }) => {
		const taskId = params.id;

		try {
			await softDeleteTask(taskId);
			return { success: true, message: 'Task deleted successfully' };
		} catch (error) {
			console.error('Error deleting task:', error);
			return { success: false, message: 'Failed to delete task' };
		}
	},

	updateTask: async ({ request, params }) => {
		const taskId = params.id;
		const formData = await request.formData();
		const status = formData.get('status') as 'todo' | 'in-progress' | 'blocked' | 'done';

		if (!status) {
			return {
				success: false,
				message: 'Status is required'
			};
		}

		try {
			await updateTask(taskId, { status });
			return {
				success: true,
				message: `Task status updated to ${status.replace('-', ' ')}`
			};
		} catch (error) {
			console.error('Error updating task status:', error);
			return {
				success: false,
				message: 'Failed to update task status'
			};
		}
	}
};
