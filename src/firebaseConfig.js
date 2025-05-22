// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCn5heRQF4Dk8onmWqxHjyXkyxz6maaCik",  // <--- replace with actual API key if needed
  authDomain: "versanttest.firebaseapp.com",
  projectId: "versanttest",
  storageBucket: "versanttest.firebasestorage.app",
  messagingSenderId: "677343693356",
  appId: "1:677343693356:web:9828ba3a882186d4809f89",
  measurementId: "G-91JD206S3Z"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

// Export named exports (no default export)
export { app, db };
