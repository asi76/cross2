// Firebase Configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Add a Web App in Project Settings
// 4. Copy the config values below

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// How to set up Firebase:
// 1. Enable Google Sign-In in Firebase Console > Authentication > Sign-in method
// 2. Create a Firestore database in Firebase Console
// 3. Add your asi.vong@gmail.com as an admin by creating a document:
//    Collection: "users"
//    Document ID: "asi.vong@gmail.com"
//    Fields: { role: "admin", approvedAt: timestamp }
