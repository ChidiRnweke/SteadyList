import { redirect } from '@sveltejs/kit';
import { getProjectById } from '$lib/projects';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const project = await getProjectById(params.id);
	if (!project) {
		throw redirect(302, '/projects');
	}

	// Extract status from URL query parameter
	const status = url.searchParams.get('status') as
		| 'todo'
		| 'in-progress'
		| 'blocked'
		| 'done'
		| null;

	return {
		project,
		status
	};
};
