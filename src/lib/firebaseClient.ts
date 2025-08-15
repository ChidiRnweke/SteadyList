// firebaseClient.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp => {
	if (!app) app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
	return app;
};

export const auth = getAuth(getFirebaseApp());

// Initialize auth persistence
export const initializeAuth = async () => {
	try {
		await setPersistence(auth, browserLocalPersistence);
	} catch (error) {
		console.error('Failed to set auth persistence:', error);
	}
};

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		return result.user;
	} catch (error) {
		console.error('Error signing in with Google:', error);
		throw error;
	}
};

export const signOutUser = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error('Error signing out:', error);
		throw error;
	}
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
	return onAuthStateChanged(auth, callback);
};
