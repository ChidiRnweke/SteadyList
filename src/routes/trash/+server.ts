import { getDeletedProjects } from '../../lib/projects';
import { getDeletedTasks } from '../../lib/tasks';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const deletedProjects = await getDeletedProjects();
		const deletedTasks = await getDeletedTasks();

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
