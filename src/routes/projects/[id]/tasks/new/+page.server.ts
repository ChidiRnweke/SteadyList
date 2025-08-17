import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { taskSchema } from '$lib/schemas/task-schema';
import { createServices } from '$lib';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);
	const project = await services.projects.getProjectById(params.id);
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
	default: async ({ params, request, locals }) => {
		const user: AuthenticatedUser | null = locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const form = await superValidate(request, zod(taskSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await services.tasks.createTask({
				projectId: params.id,
				title: form.data.title,
				description: form.data.description,
				dueDate: form.data.dueDate,
				priority: form.data.priority,
				status: form.data.status,
				reminder: form.data.reminder
			});
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating task:', error);
			return fail(500, { form });
		}
		return redirect(303, `/projects/${params.id}`);
	}
};
