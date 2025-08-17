import prisma from './prisma';
import type { CreatePromiseMadeInput, UpdatePromiseMadeInput, PromiseMade } from './types';

export interface IPromisesService {
	getAllPromises(): Promise<PromiseMade[]>;
	getPromiseById(id: string): Promise<PromiseMade | null>;
	createPromise(input: CreatePromiseMadeInput): Promise<PromiseMade>;
	updatePromise(id: string, input: UpdatePromiseMadeInput): Promise<PromiseMade | null>;
	softDeletePromise(id: string): Promise<boolean>;
	restorePromise(id: string): Promise<boolean>;
	getDeletedPromises(): Promise<PromiseMade[]>;
}

export class PromisesService implements IPromisesService {
	constructor(private userId: string) {}

	async getAllPromises(): Promise<PromiseMade[]> {
		const promises = await prisma.promise.findMany({
			where: {
				userId: this.userId,
				deleted: false
			},
			orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }]
		});

		return promises.map((promise) => ({
			...promise,
			createdAt: promise.createdAt.toISOString(),
			updatedAt: promise.updatedAt.toISOString(),
			dueDate: promise.dueDate?.toISOString(),
			promiseTo: promise.promiseTo || undefined
		}));
	}

	async getPromiseById(id: string): Promise<PromiseMade | null> {
		const promise = await prisma.promise.findFirst({
			where: { id, deleted: false, userId: this.userId }
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

	async createPromise(input: CreatePromiseMadeInput): Promise<PromiseMade> {
		const promise = await prisma.promise.create({
			data: {
				title: input.title,
				promiseTo: input.promiseTo,
				dueDate: input.dueDate ? new Date(input.dueDate) : null,
				userId: this.userId
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

	async updatePromise(id: string, input: UpdatePromiseMadeInput): Promise<PromiseMade | null> {
		const existing = await prisma.promise.findFirst({
			where: { id, deleted: false, userId: this.userId }
		});
		if (!existing) return null;

		try {
			const promise = await prisma.promise.update({
				where: { id },
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

	async softDeletePromise(id: string): Promise<boolean> {
		const existing = await prisma.promise.findFirst({ where: { id, userId: this.userId } });
		if (!existing) return false;

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

	async restorePromise(id: string): Promise<boolean> {
		const existing = await prisma.promise.findFirst({ where: { id, userId: this.userId } });
		if (!existing) return false;

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

	async getDeletedPromises(): Promise<PromiseMade[]> {
		const promises = await prisma.promise.findMany({
			where: { userId: this.userId, deleted: true },
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
}
