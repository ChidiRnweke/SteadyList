import { createServices } from '$lib';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { promiseMadeSchema, updatePromiseMadeSchema } from '$lib/schemas/promise-schema';
import type { AuthenticatedUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const user: AuthenticatedUser | null = locals.user;

	if (!user) {
		error(401, 'Not logged in.');
	}

	const services = createServices(user.uid);

	const promises = await services.promises.getAllPromises();

	return {
		promises,
		createForm: await superValidate(zod(promiseMadeSchema)),
		updateForm: await superValidate(zod(updatePromiseMadeSchema))
	};
};

export const actions: Actions = {
	create: async (event) => {
		const user: AuthenticatedUser | null = event.locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const form = await superValidate(event, zod(promiseMadeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await services.promises.createPromise(form.data);
			return { form };
		} catch (error) {
			console.error('Error creating promise:', error);
			return fail(500, {
				form,
				message: 'Failed to create promise'
			});
		}
	},

	update: async (event) => {
		const user: AuthenticatedUser | null = event.locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);
		const form = await superValidate(event, zod(updatePromiseMadeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await services.promises.updatePromise(form.data.id, form.data);
			if (!result) {
				return fail(404, {
					form,
					message: 'Promise not found'
				});
			}
			return { form };
		} catch (error) {
			console.error('Error updating promise:', error);
			return fail(500, {
				form,
				message: 'Failed to update promise'
			});
		}
	},

	delete: async (event) => {
		const user: AuthenticatedUser | null = event.locals.user;

		if (!user) {
			error(401, 'Not logged in.');
		}

		const services = createServices(user.uid);

		const formData = await event.request.formData();
		const promiseId = formData.get('id') as string;

		if (!promiseId) {
			return fail(400, {
				message: 'Promise ID is required'
			});
		}

		try {
			const success = await services.promises.softDeletePromise(promiseId);
			if (!success) {
				return fail(404, {
					message: 'Promise not found'
				});
			}
			return { success: true };
		} catch (error) {
			console.error('Error deleting promise:', error);
			return fail(500, {
				message: 'Failed to delete promise'
			});
		}
	}
};
