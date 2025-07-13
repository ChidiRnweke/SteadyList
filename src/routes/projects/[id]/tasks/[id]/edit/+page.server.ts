import { getTaskById, updateTask } from '$lib/tasks';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { taskSchema } from '$lib/schemas/task-schema';

export const load: PageServerLoad = async ({ params }) => {
	const task = await getTaskById(params.id);

	if (!task) {
		throw redirect(303, '/projects');
	}

	// Pre-populate form with existing task data
	const form = await superValidate(
		{
			title: task.title,
			description: task.description || '',
			dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
			priority: task.priority,
			status: task.status,
			reminder: task.reminder || false
		},
		zod(taskSchema)
	);

	return {
		task,
		form
	};
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const form = await superValidate(request, zod(taskSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		let task;

		try {
			// Get the task to find the project ID for redirect
			task = await getTaskById(params.id);
			if (!task) {
				return fail(404, { form });
			}

			const success = await updateTask(params.id, {
				title: form.data.title,
				description: form.data.description || undefined,
				dueDate: form.data.dueDate || undefined,
				priority: form.data.priority,
				status: form.data.status,
				reminder: form.data.reminder
			});

			if (!success) {
				return fail(500, { form });
			}
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error updating task:', error);
			return fail(500, { form });
		}
		return redirect(303, `/projects/${task.projectId}`);
	}
};
