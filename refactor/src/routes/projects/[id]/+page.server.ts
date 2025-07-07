import { getNotesByProject } from '$lib/notes';
import { getProjectById } from '$lib/projects';
import { getTasksByProject } from '$lib/tasks';
import type { Note, Project, Task } from '$lib/types';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	params
}): Promise<{ project: Project; tasks: Task[]; notes: Note[] }> => {
	const projectId = params.id;
	const [project, tasks, notes] = await Promise.all([
		getProjectById(projectId),
		getTasksByProject(projectId),
		getNotesByProject(projectId)
	]);

	if (!project) {
		throw redirect(303, '/projects');
	}
	return { project, tasks, notes };
};
