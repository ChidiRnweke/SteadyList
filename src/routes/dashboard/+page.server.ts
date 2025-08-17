import type { PageServerLoad } from './$types';
import { createServices } from '$lib';
import type { AuthenticatedUser } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);

	try {
		const [projects, tasks, notes, promises, notifications] = await Promise.all([
			services.projects.getAllProjects(),
			services.tasks.getAllTasks(),
			services.notes.getAllNotes(),
			services.promises.getAllPromises(),
			services.notifications.getNotifications()
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
