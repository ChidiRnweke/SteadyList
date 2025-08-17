import { createServices } from '$lib';
import type { AuthenticatedUser } from '$lib/server/auth';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);
	try {
		const deletedProjects = await services.projects.getDeletedProjects();
		const deletedTasks = await services.tasks.getDeletedTasks();

		return json({
			deletedProjects,
			deletedTasks
		});
	} catch (error) {
		console.error('Error fetching deleted items:', error);
		return json(
			{
				deletedProjects: [],
				deletedTasks: []
			},
			{ status: 500 }
		);
	}
};
