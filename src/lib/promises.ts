import prisma from './prisma';
import type { CreatePromiseMadeInput, UpdatePromiseMadeInput, PromiseMade } from './types';

// Mock user ID for now - replace with actual auth later
const MOCK_USER_ID = 'user-1';

export async function getAllPromises(): Promise<PromiseMade[]> {
	const promises = await prisma.promise.findMany({
		where: {
			userId: MOCK_USER_ID,
			deleted: false
		},
		orderBy: [
			{ completed: 'asc' }, // Show incomplete promises first
			{ dueDate: 'asc' }, // Then sort by due date
			{ createdAt: 'desc' } // Finally by creation date
		]
	});

	return promises.map((promise) => ({
		...promise,
		createdAt: promise.createdAt.toISOString(),
		updatedAt: promise.updatedAt.toISOString(),
		dueDate: promise.dueDate?.toISOString(),
		promiseTo: promise.promiseTo || undefined
	}));
}

export async function getPromiseById(id: string): Promise<PromiseMade | null> {
	const promise = await prisma.promise.findUnique({
		where: { id, deleted: false }
	});

	if (!promise) return null;

	return {
		...promise,
		createdAt: promise.createdAt.toISOString(),
		updatedAt: promise.updatedAt.toISOString(),
		dueDate: promise.dueDate?.toISOString(),
		promiseTo: promise.promiseTo || undefined
	};
}

export async function createPromise(input: CreatePromiseMadeInput): Promise<PromiseMade> {
	const promise = await prisma.promise.create({
		data: {
			title: input.title,
			promiseTo: input.promiseTo,
			dueDate: input.dueDate ? new Date(input.dueDate) : null,
			userId: MOCK_USER_ID
		}
	});

	return {
		...promise,
		createdAt: promise.createdAt.toISOString(),
		updatedAt: promise.updatedAt.toISOString(),
		dueDate: promise.dueDate?.toISOString(),
		promiseTo: promise.promiseTo || undefined
	};
}

export async function updatePromise(
	id: string,
	input: UpdatePromiseMadeInput
): Promise<PromiseMade | null> {
	try {
		const promise = await prisma.promise.update({
			where: { id, deleted: false },
			data: {
				...(input.title !== undefined && { title: input.title }),
				...(input.promiseTo !== undefined && { promiseTo: input.promiseTo }),
				...(input.dueDate !== undefined && {
					dueDate: input.dueDate ? new Date(input.dueDate) : null
				}),
				...(input.completed !== undefined && { completed: input.completed }),
				updatedAt: new Date()
			}
		});

		return {
			...promise,
			createdAt: promise.createdAt.toISOString(),
			updatedAt: promise.updatedAt.toISOString(),
			dueDate: promise.dueDate?.toISOString(),
			promiseTo: promise.promiseTo || undefined
		};
	} catch (error) {
		console.error('Error updating promise:', error);
		return null;
	}
}

export async function softDeletePromise(id: string): Promise<boolean> {
	try {
		await prisma.promise.update({
			where: { id },
			data: { deleted: true, updatedAt: new Date() }
		});
		return true;
	} catch (error) {
		console.error('Error deleting promise:', error);
		return false;
	}
}

export async function restorePromise(id: string): Promise<boolean> {
	try {
		await prisma.promise.update({
			where: { id },
			data: { deleted: false, updatedAt: new Date() }
		});
		return true;
	} catch (error) {
		console.error('Error restoring promise:', error);
		return false;
	}
}

export async function getDeletedPromises(): Promise<PromiseMade[]> {
	const promises = await prisma.promise.findMany({
		where: {
			userId: MOCK_USER_ID,
			deleted: true
		},
		orderBy: { updatedAt: 'desc' }
	});

	return promises.map((promise) => ({
		...promise,
		createdAt: promise.createdAt.toISOString(),
		updatedAt: promise.updatedAt.toISOString(),
		dueDate: promise.dueDate?.toISOString(),
		promiseTo: promise.promiseTo || undefined
	}));
}
