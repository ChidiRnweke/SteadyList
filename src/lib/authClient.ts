// firebaseClient.ts
import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
	getAuth,
	signInWithRedirect,
	GoogleAuthProvider,
	getRedirectResult,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { browser } from '$app/environment';

export type AuthUser = {
	uid: string;
	displayName?: string | null;
	email?: string | null;
	photoURL?: string | null;
	raw?: unknown;
};

export interface AuthService {
	initialize(): Promise<void>;
	signIn(): Promise<AuthUser | null>;
	signOut(): Promise<void>;
	onAuthStateChange(cb: (user: AuthUser | null) => void): () => void;
	getIdToken(force?: boolean): Promise<string | null>;
}

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

class FirebaseAuthClient implements AuthService {
	private app: FirebaseApp | undefined;
	private auth: ReturnType<typeof getAuth> | undefined;
	private provider = new GoogleAuthProvider();
	private rawUser: User | null = null;

	private ensureApp() {
		if (!this.app) {
			const config = { ...firebaseConfig } as FirebaseOptions;
			if (browser && import.meta.env.DEV) delete config.authDomain;
			this.app = getApps().length ? getApps()[0] : initializeApp(config);
		}
		return this.app;
	}

	private ensureAuth() {
		if (!this.auth) {
			this.ensureApp();
			this.auth = getAuth(this.app!);
		}
		return this.auth!;
	}

	// Utility to check whether the configured authDomain provides the init.json expected by the SDK
	private async canUseRedirect(): Promise<boolean> {
		if (!browser) return false;
		if (import.meta.env.DEV || !firebaseConfig.authDomain) return false;

		try {
			const initUrl = `https://${firebaseConfig.authDomain}/__/firebase/init.json`;
			const res = await fetch(initUrl, { method: 'GET', mode: 'cors' });
			if (!res.ok) return false;
			const contentType = res.headers.get('content-type') || '';
			return contentType.includes('application/json');
		} catch {
			return false;
		}
	}

	getFirebaseApp() {
		return this.app;
	}

	async initialize(): Promise<void> {
		try {
			const auth = this.ensureAuth();
			await setPersistence(auth, browserLocalPersistence);
		} catch (error) {
			console.error('Failed to set auth persistence:', error);
		}
	}

	private mapUser(u: User | null): AuthUser | null {
		if (!u) return null;
		return {
			uid: u.uid,
			displayName: u.displayName ?? null,
			email: u.email ?? null,
			photoURL: u.photoURL ?? null,
			raw: u
		};
	}

	async signIn(): Promise<AuthUser | null> {
		if (!browser) throw new Error('Cannot sign in on server');
		const auth = this.ensureAuth();

		const usePopup = import.meta.env.DEV;

		try {
			if (usePopup) {
				const result = await signInWithPopup(auth, this.provider);
				this.rawUser = result.user;
				return this.mapUser(result.user);
			}

			const ok = await this.canUseRedirect();
			if (ok) {
				await signInWithRedirect(auth, this.provider);
				return null; // redirect
			}

			const result = await signInWithPopup(auth, this.provider);
			this.rawUser = result.user;
			return this.mapUser(result.user);
		} catch (error) {
			console.error('Error signing in:', error);
			throw error;
		}
	}

	async signOut(): Promise<void> {
		try {
			const auth = this.ensureAuth();
			await signOut(auth);
			this.rawUser = null;
		} catch (error) {
			console.error('Error signing out:', error);
			throw error;
		}
	}

	// Attempt to read any redirect result (used after redirect flows)
	async getRedirectResult(): Promise<AuthUser | null> {
		if (import.meta.env.DEV || !firebaseConfig.authDomain) return null;
		const auth = this.ensureAuth();
		try {
			const ok = await this.canUseRedirect();
			if (!ok) return null;
			const result = await getRedirectResult(auth);
			this.rawUser = result?.user ?? null;
			return this.mapUser(result?.user ?? null);
		} catch (error: unknown) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				(error as { code?: string }).code === 'auth/auth-domain-config-required'
			) {
				return null;
			}
			console.error('Error getting redirect result:', error);
			return null;
		}
	}

	onAuthStateChange(cb: (user: AuthUser | null) => void): () => void {
		const auth = this.ensureAuth();
		const unsubscribe = onAuthStateChanged(auth, (u) => {
			this.rawUser = u;
			cb(this.mapUser(u));
		});
		return unsubscribe as () => void;
	}

	async getIdToken(force = false): Promise<string | null> {
		if (!browser) return null;
		if (this.rawUser) {
			const maybe = this.rawUser as unknown as {
				getIdToken?: (force?: boolean) => Promise<string>;
			};
			if (typeof maybe.getIdToken === 'function') {
				try {
					return await maybe.getIdToken(force);
				} catch (e) {
					console.error('Failed to get ID token from provider user:', e);
					return null;
				}
			}
		}
		// if rawUser isn't available, try to ensure auth and read currentUser
		try {
			const auth = this.ensureAuth();
			const current = (auth as unknown as { currentUser?: unknown }).currentUser as
				| User
				| undefined;
			if (current) {
				const maybe = current as unknown as { getIdToken?: (force?: boolean) => Promise<string> };
				if (typeof maybe.getIdToken === 'function') {
					return await maybe.getIdToken(force);
				}
			}
		} catch (e) {
			console.error('Failed to read current user for token:', e);
		}
		return null;
	}
}

const authClient = new FirebaseAuthClient();
export default authClient;
