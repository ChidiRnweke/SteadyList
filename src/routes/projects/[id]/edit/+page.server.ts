import type { PageServerLoad, Actions } from './$types';
import { redirect, fail, error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { projectSchema } from '$lib/schemas/project-schema';
import { createServices } from '$lib';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);
	const project = await services.projects.getProjectById(params.id);
	if (!project) {
		throw redirect(303, '/projects');
	}

	// Pre-populate form with existing project data
	const form = await superValidate(
		{
			name: project.name,
			description: project.description || ''
		},
		zod(projectSchema)
	);

	return {
		project,
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

		const form = await superValidate(request, zod(projectSchema));
		let success;
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			success = await services.projects.updateProject(params.id, {
				name: form.data.name,
				description: form.data.description
			});

			if (!success) {
				return fail(500, { form });
			}
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error updating project:', error);
			return fail(500, { form });
		}
		return redirect(303, `/projects/${params.id}`);
	}
};
