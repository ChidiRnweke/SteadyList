import { restoreProject } from '../../lib/projects';
import { restoreTask } from '../../lib/tasks';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	restore: async ({ request }) => {
		const formData = await request.formData();
		const type = formData.get('type') as string;
		const id = formData.get('id') as string;

		if (!type || !id) {
			return fail(400, {
				success: false,
				message: 'Missing required fields'
			});
		}

		try {
			if (type === 'project') {
				const success = await restoreProject(id);
				if (success) {
					return {
						success: true,
						message: 'Project restored successfully'
					};
				}
			} else if (type === 'task') {
				const success = await restoreTask(id);
				if (success) {
					return {
						success: true,
						message: 'Task restored successfully'
					};
				}
			}

			return fail(500, {
				success: false,
				message: 'Failed to restore item'
			});
		} catch (error) {
			console.error('Error restoring item:', error);
			return fail(500, {
				success: false,
				message: 'An error occurred'
			});
		}
	}
};
