import { redirect, fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteTaskSchema } from '$lib/schemas/delete-schema';
import { createServices } from '$lib';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	return {
		deleteForm: await superValidate(zod(deleteTaskSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const user: AuthenticatedUser | null = locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const formData = await request.formData();
		console.log('formData', formData);
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const dueDateStr = formData.get('dueDate') as string;
		const priority = formData.get('priority') as 'low' | 'medium' | 'high';
		const status = formData.get('status') as 'todo' | 'in-progress' | 'blocked' | 'done';
		const reminder = formData.get('reminder') === 'on';

		// Convert dueDate string to Date object if present
		const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;

		await services.tasks.createTask({
			title,
			description,
			dueDate,
			priority,
			status,
			reminder,
			projectId: params.id
		});

		throw redirect(302, `/projects/${params.id}`);
	},

	delete: async ({ request, params, locals }) => {
		const user: AuthenticatedUser | null = locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const form = await superValidate(request, zod(deleteTaskSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const success = await services.tasks.deleteTask(form.data.taskId);

		if (!success) {
			return fail(404, {
				form,
				message: 'Task not found or failed to delete'
			});
		}

		throw redirect(302, `/projects/${params.id}`);
	}
};
