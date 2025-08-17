import { createServices } from '$lib';
import type { Note, Project, Task } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail, error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteTaskSchema } from '$lib/schemas/delete-schema';
import type { SuperValidated, Infer } from 'sveltekit-superforms';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({
	params,
	locals
}): Promise<{
	project: Project;
	tasks: Task[];
	notes: Note[];
	deleteForm: SuperValidated<Infer<typeof deleteTaskSchema>>;
}> => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);

	const projectId = params.id;
	const [project, tasks, notes, deleteForm] = await Promise.all([
		services.projects.getProjectById(projectId),
		services.tasks.getTasksByProject(projectId),
		services.notes.getNotesByProject(projectId),
		superValidate(zod(deleteTaskSchema))
	]);

	if (!project) {
		throw redirect(303, '/projects');
	}

	return { project, tasks, notes, deleteForm };
};

export const actions: Actions = {
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
