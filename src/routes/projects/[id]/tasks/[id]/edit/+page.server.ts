import { getTaskById } from '$lib/tasks';
import type { Task } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }): Promise<{ task: Task }> => {
	const task = await getTaskById(params.id);

	return {
		task: task!
	};
};
