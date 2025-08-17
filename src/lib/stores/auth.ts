import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import authClient, { type AuthUser } from '$lib/authClient';

// Auth store
export const user = writable<AuthUser | null>(null);
export const loading = writable<boolean>(true);
export const initialized = writable<boolean>(false);
export const idToken = writable<string | null>(null);

// Initialize auth when in browser
if (browser) {
	// Initialize auth persistence
	authClient.initialize().then(() => {
		initialized.set(true);

		// Listen for auth state changes (provider-agnostic AuthUser)
		authClient.onAuthStateChange(async (authUser: AuthUser | null) => {
			user.set(authUser);

			if (authUser) {
				try {
					// Get fresh ID token from the auth service
					const token = await authClient.getIdToken();
					idToken.set(token);

					// Store token in cookie for server-side access
					document.cookie = `firebase-token=${token}; path=/; secure; samesite=strict; max-age=3600`;

					// Refresh token every 50 minutes (tokens expire after 1 hour)
					setInterval(
						async () => {
							try {
								const freshToken = await authClient.getIdToken(true);
								idToken.set(freshToken);
								document.cookie = `firebase-token=${freshToken}; path=/; secure; samesite=strict; max-age=3600`;
							} catch (error) {
								console.error('Failed to refresh token:', error);
							}
						},
						50 * 60 * 1000
					); // 50 minutes
				} catch (error) {
					console.error('Failed to get ID token:', error);
					idToken.set(null);
				}
			} else {
				idToken.set(null);
				// Clear token cookie
				document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			}

			loading.set(false);
		});
	});
}

export const getCurrentUser = (): Promise<AuthUser | null> => {
	return new Promise((resolve) => {
		if (!browser) {
			resolve(null);
			return;
		}

		const unsubscribe = user.subscribe((currentUser) => {
			unsubscribe();
			resolve(currentUser as AuthUser | null);
		});
	});
};

// Get current ID token
export const getCurrentIdToken = (): Promise<string | null> => {
	return new Promise((resolve) => {
		if (!browser) {
			resolve(null);
			return;
		}

		const unsubscribe = idToken.subscribe((token) => {
			unsubscribe();
			resolve(token);
		});
	});
};

// Make authenticated fetch request
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
	const token = await getCurrentIdToken();

	const headers = new Headers(options.headers);
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	return fetch(url, {
		...options,
		headers
	});
};
