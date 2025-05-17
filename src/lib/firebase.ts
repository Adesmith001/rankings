
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDJtqj1BtqJQaVeJVD7ooQ6MmIwpKvZkG8",
  authDomain: "caloriestracker-bd250.firebaseapp.com",
  projectId: "caloriestracker-bd250",
  storageBucket: "caloriestracker-bd250.firebasestorage.app",
  messagingSenderId: "1005800375557",
  appId: "1:1005800375557:web:2e9d3cc9b297463c0f636c",
  measurementId: "G-HFRHK3VFQ0"
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
