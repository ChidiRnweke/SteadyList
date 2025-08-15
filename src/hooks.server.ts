import type { Handle, HandleFetch } from '@sveltejs/kit';
import { addUserToLocals } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

// List of routes that don't require authentication
const publicRoutes = ['/login'];

// List of API routes that require authentication
const protectedApiRoutes = ['/api/'];

export const handle: Handle = async ({ event, resolve }) => {
	// Add user to locals for all requests
	await addUserToLocals(event);

	const { pathname } = event.url;
	const isPublicRoute = publicRoutes.some(
		(route) => pathname === route || pathname.startsWith(route)
	);
	const isApiRoute = pathname.startsWith('/api/');
	const isProtectedApiRoute = protectedApiRoutes.some((route) => pathname.startsWith(route));

	// For protected API routes, require authentication
	if (isProtectedApiRoute && !event.locals.user) {
		return new Response(
			JSON.stringify({
				error: 'Authentication required'
			}),
			{
				status: 401,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}

	// For non-API routes (pages), redirect to login if not authenticated
	if (!isApiRoute && !isPublicRoute && !event.locals.user) {
		// Store the current path to redirect back after login
		const redirectTo = `${pathname}${event.url.search}`;
		throw redirect(302, `/login?redirect=${encodeURIComponent(redirectTo)}`);
	}

	// If user is authenticated and trying to access login page, redirect to home
	if (event.locals.user && pathname === '/login') {
		const redirectTo = event.url.searchParams.get('redirect') || '/';
		throw redirect(302, redirectTo);
	}

	const response = await resolve(event);

	// Add security headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	// For same-origin requests, forward the authentication cookie
	if (request.url.startsWith(event.url.origin)) {
		// Get the Firebase token from cookies
		const firebaseToken = event.cookies.get('firebase-token');

		if (firebaseToken && !request.headers.has('authorization')) {
			// Clone the request and add the authorization header
			const newRequest = new Request(request, {
				headers: {
					...Object.fromEntries(request.headers),
					Authorization: `Bearer ${firebaseToken}`
				}
			});

			return fetch(newRequest);
		}
	}

	return fetch(request);
};
