import { getNotesByProject } from '$lib/notes';
import { getProjectById } from '$lib/projects';
import { getTasksByProject, deleteTask } from '$lib/tasks';
import type { Note, Project, Task } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteTaskSchema } from '$lib/schemas/delete-schema';
import type { SuperValidated, Infer } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({
	params
}): Promise<{
	project: Project;
	tasks: Task[];
	notes: Note[];
	deleteForm: SuperValidated<Infer<typeof deleteTaskSchema>>;
}> => {
	const projectId = params.id;
	const [project, tasks, notes, deleteForm] = await Promise.all([
		getProjectById(projectId),
		getTasksByProject(projectId),
		getNotesByProject(projectId),
		superValidate(zod(deleteTaskSchema))
	]);

	if (!project) {
		throw redirect(303, '/projects');
	}

	return { project, tasks, notes, deleteForm };
};

export const actions: Actions = {
	delete: async ({ request, params }) => {
		const form = await superValidate(request, zod(deleteTaskSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const success = await deleteTask(form.data.taskId);

		if (!success) {
			return fail(404, {
				form,
				message: 'Task not found or failed to delete'
			});
		}

		throw redirect(302, `/projects/${params.id}`);
	}
};
