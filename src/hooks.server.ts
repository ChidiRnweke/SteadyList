import type { Handle } from '@sveltejs/kit';
import authVerifier from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const publicRoutes = ['/login', '/'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isPublicRoute = publicRoutes.some((route) => pathname === route);

	if (!isPublicRoute) {
		try {
			const authCookie = event.cookies.get('firebase-token') || null;
			const token = await authVerifier.verifyAuthentication(authCookie);
			event.locals.user = authVerifier.extractUser(token);
		} catch (error) {
			console.error('Error verifying authentication:', error);
			throw redirect(302, '/login');
		}
	}

	const response = await resolve(event);

	return response;
};
