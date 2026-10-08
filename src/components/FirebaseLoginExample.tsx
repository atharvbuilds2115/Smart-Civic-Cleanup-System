// EXAMPLE: How to use Firebase in your Login component
import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/firebaseService';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

/**
 * This is an EXAMPLE component showing how to integrate Firebase authentication
 * Copy and adapt these patterns to your actual Login.tsx component
 */
export const FirebaseLoginExample = () => {
  const { user, loading } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = await loginUser(email, password);
        console.log('Login successful:', user.email);
        // Navigate to dashboard after successful login
      } else {
        const user = await registerUser(email, password);
        console.log('Registration successful:', user.email);
        // Navigate to setup profile after successful registration
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading authentication...</div>;
  }

  if (user) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold">Welcome, {user.email}!</p>
        <p className="text-sm text-gray-500">UID: {user.uid}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 border rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {isLogin ? 'Login' : 'Register'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleAuthenticate} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="w-full mt-4 text-blue-600 hover:underline"
      >
        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default FirebaseLoginExample;
