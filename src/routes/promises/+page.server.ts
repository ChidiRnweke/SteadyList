import { getAllPromises, createPromise, updatePromise, softDeletePromise } from '$lib/promises';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { promiseMadeSchema, updatePromiseMadeSchema } from '$lib/schemas/promise-schema';

export const load: PageServerLoad = async () => {
	const promises = await getAllPromises();

	return {
		promises,
		createForm: await superValidate(zod(promiseMadeSchema)),
		updateForm: await superValidate(zod(updatePromiseMadeSchema))
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(promiseMadeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await createPromise(form.data);
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
		const form = await superValidate(event, zod(updatePromiseMadeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await updatePromise(form.data.id, form.data);
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
		const formData = await event.request.formData();
		const promiseId = formData.get('id') as string;

		if (!promiseId) {
			return fail(400, {
				message: 'Promise ID is required'
			});
		}

		try {
			const success = await softDeletePromise(promiseId);
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
