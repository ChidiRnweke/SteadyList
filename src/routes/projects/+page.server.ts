import { getAllProjects, softDeleteProject } from '$lib/projects';
import { getAllTasks } from '$lib/tasks';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteProjectSchema } from '$lib/schemas/delete-schema';

export const load: PageServerLoad = async () => {
	const projects = await getAllProjects();
	const tasks = await getAllTasks();

	return {
		projects,
		tasks,
		deleteForm: await superValidate(zod(deleteProjectSchema))
	};
};

export const actions: Actions = {
	deleteProject: async (event) => {
		const form = await superValidate(event, zod(deleteProjectSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const success = await softDeleteProject(form.data.projectId);

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
