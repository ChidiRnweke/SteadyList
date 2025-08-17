import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { projectSchema } from '$lib/schemas/project-schema';
import { createServices } from '$lib';
import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(projectSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user: AuthenticatedUser | null = locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const form = await superValidate(request, zod(projectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		let project;
		try {
			project = await services.projects.createProject({
				name: form.data.name,
				description: form.data.description
			});
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating project:', error);
			return fail(500, { form });
		}
		return redirect(303, `/projects/${project.id}`);
	}
};
