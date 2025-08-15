import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';

let adminApp: App;

// Initialize Firebase Admin SDK
export const getFirebaseAdmin = () => {
	if (!adminApp && getApps().length === 0) {
		try {
			if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
				// Parse the service account key from environment variable
				const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
				adminApp = initializeApp({
					credential: cert(serviceAccount),
					projectId: process.env.VITE_FIREBASE_PROJECT_ID
				});
			} else {
				adminApp = initializeApp({
					projectId: process.env.VITE_FIREBASE_PROJECT_ID
				});
			}
		} catch (error) {
			console.error('Failed to initialize Firebase Admin:', error);
			throw error;
		}
	} else if (!adminApp) {
		adminApp = getApps()[0];
	}

	return adminApp;
};

export const adminAuth = () => getAuth(getFirebaseAdmin());

// Verify Firebase ID Token
export const verifyIdToken = async (idToken: string): Promise<DecodedIdToken | null> => {
	try {
		const decodedToken = await adminAuth().verifyIdToken(idToken);
		return decodedToken;
	} catch (error) {
		console.error('Error verifying ID token:', error);
		return null;
	}
};

// Get user by UID
export const getUserByUid = async (uid: string) => {
	try {
		const userRecord = await adminAuth().getUser(uid);
		return userRecord;
	} catch (error) {
		console.error('Error getting user:', error);
		return null;
	}
};
