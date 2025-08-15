import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { requireAuth } from './auth';
import type { AuthenticatedUser } from './auth';

// Wrapper for authenticated form actions
export const withAuth = <T extends Record<string, unknown>>(
	action: (event: RequestEvent, user: AuthenticatedUser) => Promise<T>
) => {
	return async (event: RequestEvent): Promise<T> => {
		try {
			const user = await requireAuth(event);
			return await action(event, user);
		} catch (error) {
			console.error('Authentication error in action:', error);
			return fail(401, {
				error: 'Authentication required',
				message: 'You must be logged in to perform this action'
			}) as unknown as T;
		}
	};
};

// Wrapper for authenticated load functions
export const withAuthLoad = <T extends Record<string, unknown>>(
	loader: (event: RequestEvent, user: AuthenticatedUser) => Promise<T>
) => {
	return async (event: RequestEvent): Promise<T> => {
		try {
			const user = await requireAuth(event);
			return await loader(event, user);
		} catch (error) {
			console.error('Authentication error in loader:', error);
			throw error;
		}
	};
};

export const checkResourceOwnership = (
	resourceUserId: string,
	currentUser: AuthenticatedUser
): boolean => {
	return resourceUserId === currentUser.uid;
};

export const requireResourceOwnership = (
	resourceUserId: string,
	currentUser: AuthenticatedUser,
	resourceType = 'resource'
): void => {
	if (!checkResourceOwnership(resourceUserId, currentUser)) {
		throw new Error(`Access denied: You don't have permission to access this ${resourceType}`);
	}
};
