// firebaseClient.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { browserLocalPersistence, setPersistence } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyA_RduKFyay-o9bVxi4mKbok49lS3SBgFk",
  authDomain: "steadylist-25414.firebaseapp.com",
  projectId: "steadylist-25414",
  storageBucket: "steadylist-25414.appspot.com",
  messagingSenderId: "179649979230",
  appId: "1:179649979230:web:dd2bb9a38ff7c6b44465cf",
  measurementId: "G-JMPGDEVWGE",
};

let app: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp => {
  if (!app)
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return app;
};

export const auth = getAuth(getFirebaseApp());
await setPersistence(auth, browserLocalPersistence);
