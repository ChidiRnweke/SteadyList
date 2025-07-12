import { getProjectById } from '$lib/projects';
import type { Project } from '$lib/types';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }): Promise<{ project: Project }> => {
	const project = await getProjectById(params.id);
	if (!project) {
		throw redirect(303, '/projects');
	}
	return {
		project
	};
};
