// client/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 Make sure this is here

const firebaseConfig = {
  apiKey: "AIzaSyCDZRmnynLCPHaVTEw0386V_9mF6sgRQCY",
  authDomain: "krishigrowprototype.firebaseapp.com",
  projectId: "krishigrowprototype",
  storageBucket: "krishigrowprototype.firebasestorage.app",
  messagingSenderId: "605867956544",
  appId: "1:605867956544:web:bfcf203b263801490e82a5",
  measurementId: "G-VN7EFS4DF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication & Database
export const auth = getAuth(app);
export const db = getFirestore(app); 