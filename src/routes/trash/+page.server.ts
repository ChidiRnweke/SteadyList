import { restoreProject, getDeletedProjects } from '../../lib/projects';
import { restoreTask, getDeletedTasks } from '../../lib/tasks';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	try {
		const [deletedTasks, deletedProjects] = await Promise.all([
			getDeletedTasks(),
			getDeletedProjects()
		]);

		return {
			deletedTasks,
			deletedProjects
		};
	} catch (error) {
		console.error('Error loading trash items:', error);
		return {
			deletedTasks: [],
			deletedProjects: []
		};
	}
};

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
	},

	bulkRestore: async ({ request }) => {
		const formData = await request.formData();
		const items = formData.get('items') as string;

		if (!items) {
			return fail(400, {
				success: false,
				message: 'No items selected'
			});
		}

		try {
			const parsedItems = JSON.parse(items);
			let successCount = 0;
			const totalCount = parsedItems.length;

			for (const item of parsedItems) {
				try {
					if (item.type === 'project') {
						const success = await restoreProject(item.id);
						if (success) successCount++;
					} else if (item.type === 'task') {
						const success = await restoreTask(item.id);
						if (success) successCount++;
					}
				} catch (error) {
					console.error(`Error restoring ${item.type} ${item.id}:`, error);
				}
			}

			if (successCount === totalCount) {
				return {
					success: true,
					message: `All ${totalCount} items restored successfully`
				};
			} else if (successCount > 0) {
				return {
					success: true,
					message: `${successCount} of ${totalCount} items restored successfully`
				};
			} else {
				return fail(500, {
					success: false,
					message: 'Failed to restore any items'
				});
			}
		} catch (error) {
			console.error('Error bulk restoring items:', error);
			return fail(500, {
				success: false,
				message: 'An error occurred during bulk restore'
			});
		}
	}
};
