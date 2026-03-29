// In your sign-up component file (e.g., client/src/pages/SignUp.tsx)

import React, { useState } from 'react';
import { signUpUser } from '../../lib/firebase/auth'; // Import the function

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await signUpUser(email, password);
    if (user) {
      // Handle successful signs-up, e.g., redirect to onboarding page
      console.log("Sign-up successful, redirecting...");
    } else {
      // Handle failed sign-up, e.g., show an error message
      console.log("Sign-up failed.");
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <h2>Create an Account</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}