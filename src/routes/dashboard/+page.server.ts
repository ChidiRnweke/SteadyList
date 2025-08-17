import type { PageServerLoad } from './$types';
import { getAllProjects } from '$lib/projects';
import { getAllTasks } from '$lib/tasks';
import { getNotifications } from '$lib/notifications';
import { getAllNotes } from '$lib/notes';
import { getAllPromises } from '$lib/promises';
import type { AuthenticatedUser } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}
	try {
		const [projects, tasks, notes, promises, notifications] = await Promise.all([
			getAllProjects(),
			getAllTasks(),
			getAllNotes(),
			getAllPromises(),
			getNotifications()
		]);

		return {
			projects,
			tasks,
			notes,
			promises,
			notifications,
			user
		};
	} catch (e) {
		console.error('Error loading dashboard data:', e);
		error(500, 'Failed to load dashboard data');
	}
};
