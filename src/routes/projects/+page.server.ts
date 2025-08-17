import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteProjectSchema } from '$lib/schemas/delete-schema';
import { createServices } from '$lib';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);

	const projects = await services.projects.getAllProjects();
	const tasks = await services.tasks.getAllTasks();

	return {
		projects,
		tasks,
		deleteForm: await superValidate(zod(deleteProjectSchema))
	};
};

export const actions: Actions = {
	deleteProject: async (event) => {
		const user: AuthenticatedUser | null = event.locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const form = await superValidate(event, zod(deleteProjectSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const success = await services.projects.softDeleteProject(form.data.projectId);

			if (success) {
				return {
					form
				};
			} else {
				return fail(404, {
					form,
					message: 'Project not found'
				});
			}
		} catch (error) {
			console.error('Error deleting project:', error);
			return fail(500, {
				form,
				message: 'An error occurred while deleting the project'
			});
		}
	}
};
