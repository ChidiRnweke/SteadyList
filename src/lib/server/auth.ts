import admin from 'firebase-admin';

export type DecodedToken = Record<string, unknown> | null;

export interface AuthenticatedUser {
	uid: string;
	email: string | undefined;
	displayName: string | undefined;
	emailVerified: boolean;
	decodedToken: DecodedToken;
}

export interface AuthVerifier {
	verifyAuthentication(authHeader: string | null): Promise<DecodedToken>;
	extractUser(decodedToken: DecodedToken): AuthenticatedUser;
}

function ensureAdminInitialized() {
	const projectId = process.env.FIREBASE_PROJECT_ID;

	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.applicationDefault(),
			projectId
		});
	}
}

async function verifyTokenWithAdmin(idToken: string): Promise<DecodedToken> {
	try {
		ensureAdminInitialized();
		const decoded = await admin.auth().verifyIdToken(idToken);
		return decoded as DecodedToken;
	} catch (error) {
		console.error('Failed to verify ID token with admin SDK:', error);
		throw new Error('Invalid ID token');
	}
}

export const firebaseAuthVerifier: AuthVerifier = {
	async verifyAuthentication(authCookie: string | null): Promise<DecodedToken> {
		if (authCookie) {
			return await verifyTokenWithAdmin(authCookie);
		}

		console.warn('No authentication token found in request');
		throw new Error('No authentication token found');
	},

	extractUser(decodedToken: DecodedToken) {
		const t = decodedToken as unknown as Record<string, unknown>;
		const uid = String(t.uid ?? '');
		const email = typeof t.email === 'string' ? (t.email as string) : undefined;
		const name = typeof t.name === 'string' ? (t.name as string) : undefined;
		const email_verified = Boolean(t.email_verified ?? false);
		return {
			uid,
			email,
			displayName: name,
			emailVerified: email_verified,
			decodedToken
		};
	}
};

export default firebaseAuthVerifier;
