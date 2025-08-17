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
			console.log('Authenticated user:', event.locals.user);
		} catch (error) {
			console.error('Error verifying authentication:', error);
			throw redirect(302, '/login');
		}
	}

	// If user is authenticated and trying to access login page, redirect to home
	if (event.locals.user && pathname === '/login') {
		const redirectTo = event.url.searchParams.get('redirect') || '/';
		throw redirect(302, redirectTo);
	}

	const response = await resolve(event);

	return response;
};
