// In client/src/lib/firebase/auth.ts

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, type User } from "firebase/auth";
import { firebaseConfig } from "../../firebaseConfig"; // Adjust path if needed

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to sign up a new user
export const signUpUser = async (email: string, password: string): Promise<User | undefined> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up successfully
    const user = userCredential.user;
    console.log("User signed up:", user.uid);
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
  }
};