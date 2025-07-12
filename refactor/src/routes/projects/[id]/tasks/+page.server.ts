import { createTask } from '$lib/tasks';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, params }) => {
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

		await createTask({
			title,
			description,
			dueDate,
			priority,
			status,
			reminder,
			projectId: params.id
		});

		throw redirect(302, `/projects/${params.id}`);
	}
};
