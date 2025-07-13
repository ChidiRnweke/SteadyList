import { redirect, fail } from '@sveltejs/kit';
import { getProjectById } from '$lib/projects';
import { createTask } from '$lib/tasks';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { taskSchema } from '$lib/schemas/task-schema';

export const load: PageServerLoad = async ({ params, url }) => {
	const project = await getProjectById(params.id);
	if (!project) {
		throw redirect(302, '/projects');
	}

	// Extract status from URL query parameter
	const status = url.searchParams.get('status') as
		| 'todo'
		| 'in-progress'
		| 'blocked'
		| 'done'
		| null;

	// Initialize form with default values
	const form = await superValidate(
		{
			title: '',
			description: '',
			priority: 'medium' as const,
			status: status || ('todo' as const),
			reminder: false
		},
		zod(taskSchema)
	);

	return {
		project,
		status,
		form
	};
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const form = await superValidate(request, zod(taskSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const task = await createTask({
				projectId: params.id,
				title: form.data.title,
				description: form.data.description,
				dueDate: form.data.dueDate,
				priority: form.data.priority,
				status: form.data.status,
				reminder: form.data.reminder
			});

			throw redirect(303, `/projects/${params.id}/tasks/${task.id}`);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating task:', error);
			return fail(500, { form });
		}
	}
};
