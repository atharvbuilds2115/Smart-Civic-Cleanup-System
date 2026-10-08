import React, { useEffect, useState } from 'react';
import { auth, firebaseConfigError } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * FirebaseAuth Provider Hook
 * Use this hook to access current user authentication state throughout your app
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseConfigError) {
      setError(firebaseConfigError);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

export default useFirebaseAuth;
