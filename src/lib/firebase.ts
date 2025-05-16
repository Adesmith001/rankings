
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const firestore = getFirestore(app);

export { app, firestore };

/**
 * IMPORTANT: How to use this file:
 *
 * 1. Go to your Firebase project console.
 * 2. Navigate to Project settings (gear icon).
 * 3. Under "Your apps", click the web icon (</>) to add a web app or select your existing web app.
 * 4. Copy the `firebaseConfig` object provided by Firebase.
 * 5. Replace the placeholder `firebaseConfig` object above with your actual configuration.
 *
 * Ensure your Firestore database is created and you've set appropriate
 * security rules (for development, "test mode" is okay, but secure it for production).
 */
