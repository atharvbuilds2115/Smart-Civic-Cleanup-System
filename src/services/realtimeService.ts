import {
  collection,
  onSnapshot,
  query,
  where,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../firebase.config';

/**
 * Real-time listener for Firestore collections
 * Perfect for tracking trucks, bins, and live updates
 */

export type UnsubscribeFn = () => void;

/**
 * Listen to real-time updates for a collection
 * @param collectionName - Firestore collection name
 * @param callbacks - Object with onData and onError callbacks
 * @returns Unsubscribe function
 */
export const subscribeToCollection = (
  collectionName: string,
  callbacks: {
    onData: (data: any[]) => void;
    onError?: (error: Error) => void;
  }
): UnsubscribeFn => {
  const q = query(collection(db, collectionName));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callbacks.onData(data);
    },
    (error) => {
      console.error(`Error listening to ${collectionName}:`, error);
      callbacks.onError?.(error);
    }
  );

  return unsubscribe;
};

/**
 * Listen to real-time updates for a specific field value
 * Example: Listen to all trucks with status="available"
 */
export const subscribeToField = (
  collectionName: string,
  fieldName: string,
  fieldValue: any,
  callbacks: {
    onData: (data: any[]) => void;
    onError?: (error: Error) => void;
  }
): UnsubscribeFn => {
  const q = query(
    collection(db, collectionName),
    where(fieldName, '==', fieldValue)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callbacks.onData(data);
    },
    (error) => {
      console.error(`Error listening to ${collectionName}:`, error);
      callbacks.onError?.(error);
    }
  );

  return unsubscribe;
};

/**
 * Listen to a specific document
 * Example: Listen to truck location updates
 */
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callbacks: {
    onData: (data: any) => void;
    onError?: (error: Error) => void;
  }
): UnsubscribeFn => {
  const q = query(
    collection(db, collectionName),
    where('__name__', '==', docId)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const doc = querySnapshot.docs[0];
      if (doc) {
        callbacks.onData({ id: doc.id, ...doc.data() });
      }
    },
    (error) => {
      console.error(`Error listening to document:`, error);
      callbacks.onError?.(error);
    }
  );

  return unsubscribe;
};

/**
 * Usage Example in a React Component:
 *
 * import { useEffect, useState } from 'react';
 * import { subscribeToCollection, subscribeToField } from './services/realtimeService';
 *
 * function TruckTracker() {
 *   const [trucks, setTrucks] = useState([]);
 *   const [activeTrucks, setActiveTrucks] = useState([]);
 *   const [error, setError] = useState(null);
 *
 *   useEffect(() => {
 *     // Listen to ALL trucks
 *     const unsubscribe = subscribeToCollection('trucks', {
 *       onData: (data) => {
 *         setTrucks(data);
 *         console.log('Updated trucks:', data);
 *       },
 *       onError: (err) => setError(err.message),
 *     });
 *
 *     // Cleanup subscription on unmount
 *     return () => unsubscribe();
 *   }, []);
 *
 *   useEffect(() => {
 *     // Listen only to active trucks
 *     const unsubscribe = subscribeToField('trucks', 'status', 'active', {
 *       onData: (data) => {
 *         setActiveTrucks(data);
 *         console.log('Active trucks:', data);
 *       },
 *     });
 *
 *     return () => unsubscribe();
 *   }, []);
 *
 *   return (
 *     <div>
 *       <h2>All Trucks ({trucks.length})</h2>
 *       <h2>Active Trucks ({activeTrucks.length})</h2>
 *       {error && <p>Error: {error}</p>}
 *     </div>
 *   );
 * }
 */
