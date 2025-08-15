import type { RequestEvent } from '@sveltejs/kit';
import { verifyIdToken } from './firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedUser {
	uid: string;
	email: string | undefined;
	displayName: string | undefined;
	emailVerified: boolean;
	decodedToken: DecodedIdToken;
}

// Extract Firebase ID token from request
export const getIdTokenFromRequest = (event: RequestEvent): string | null => {
	// Try to get token from Authorization header
	const authHeader = event.request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}

	// Try to get token from cookie
	const tokenCookie = event.cookies.get('firebase-token');
	if (tokenCookie) {
		return tokenCookie;
	}

	return null;
};

// Verify user authentication from request
export const verifyAuthentication = async (
	event: RequestEvent
): Promise<AuthenticatedUser | null> => {
	const idToken = getIdTokenFromRequest(event);

	if (!idToken) {
		return null;
	}

	const decodedToken = await verifyIdToken(idToken);

	if (!decodedToken) {
		return null;
	}

	return {
		uid: decodedToken.uid,
		email: decodedToken.email,
		displayName: decodedToken.name,
		emailVerified: decodedToken.email_verified || false,
		decodedToken
	};
};

// Require authentication (throws error if not authenticated)
export const requireAuth = async (event: RequestEvent): Promise<AuthenticatedUser> => {
	const user = await verifyAuthentication(event);

	if (!user) {
		throw new Error('Authentication required');
	}

	return user;
};

// Add to locals for use in load functions and actions
export const addUserToLocals = async (event: RequestEvent) => {
	const user = await verifyAuthentication(event);
	event.locals.user = user;
	return user;
};
