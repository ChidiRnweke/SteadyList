import { getAllProjects, createProject } from '$lib/projects';
import { getAllTasks } from '$lib/tasks';
import type { Project, Task } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (): Promise<{ projects: Project[]; tasks: Task[] }> => {
	const projects = await getAllProjects();
	const tasks = await getAllTasks();
	return { projects, tasks };
};

export const actions = {
	default: async ({ request }) => {
		if (request.method === 'POST') {
			const formData = await request.formData();
			const name = formData.get('name') as string;
			const description = formData.get('description') as string;

			const project = await createProject({ name, description });
			return redirect(303, `/projects/${project.id}`);
		}
	}
} satisfies Actions;
