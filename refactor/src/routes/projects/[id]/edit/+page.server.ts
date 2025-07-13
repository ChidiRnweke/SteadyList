import { getProjectById, updateProject } from '$lib/projects';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { projectSchema } from '$lib/schemas/project-schema';

export const load: PageServerLoad = async ({ params }) => {
	const project = await getProjectById(params.id);
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
	default: async ({ params, request }) => {
		const form = await superValidate(request, zod(projectSchema));
		let success;
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			success = await updateProject(params.id, {
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
