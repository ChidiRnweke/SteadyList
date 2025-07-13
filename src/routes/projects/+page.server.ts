import { getAllProjects } from '$lib/projects';
import { getAllTasks } from '$lib/tasks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const projects = await getAllProjects();
	const tasks = await getAllTasks();

	return {
		projects,
		tasks
	};
};
