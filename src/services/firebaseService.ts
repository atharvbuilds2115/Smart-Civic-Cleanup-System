import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  Query,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, storage, auth, firebaseConfigError } from '../firebase.config';

const requireAuth = () => {
  if (!auth) {
    throw new Error(firebaseConfigError || 'Firebase Auth is not initialized.');
  }
  return auth;
};

const requireDb = () => {
  if (!db) {
    throw new Error(firebaseConfigError || 'Firestore is not initialized.');
  }
  return db;
};

const requireStorage = () => {
  if (!storage) {
    throw new Error(firebaseConfigError || 'Firebase Storage is not initialized.');
  }
  return storage;
};

// ==================== AUTHENTICATION ====================

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(requireAuth(), email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(requireAuth(), email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(requireAuth());
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// ==================== USERS COLLECTION ====================

export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await updateDoc(doc(requireDb(), 'users', userId), {
      ...userData,
      createdAt: Timestamp.now(),
      role: userData.role || 'citizen',
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(requireDb(), 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// ==================== BINS COLLECTION ====================

export const addBin = async (binData: any) => {
  try {
    const docRef = await addDoc(collection(requireDb(), 'bins'), {
      ...binData,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      status: 'empty',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding bin:', error);
    throw error;
  }
};

export const getBins = async () => {
  try {
    const q = query(collection(requireDb(), 'bins'), orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching bins:', error);
    throw error;
  }
};

export const getBinById = async (binId: string) => {
  try {
    const docSnap = await getDoc(doc(requireDb(), 'bins', binId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error fetching bin:', error);
    throw error;
  }
};

export const updateBin = async (binId: string, updates: any) => {
  try {
    await updateDoc(doc(requireDb(), 'bins', binId), {
      ...updates,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating bin:', error);
    throw error;
  }
};

// ==================== REPORTS COLLECTION ====================

export const addReport = async (reportData: any) => {
  try {
    const docRef = await addDoc(collection(requireDb(), 'reports'), {
      ...reportData,
      createdAt: Timestamp.now(),
      status: 'pending',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

export const getReports = async (filters?: { userId?: string; status?: string }) => {
  try {
    let q: Query;
    const constraints: any[] = [];

    if (filters?.userId) constraints.push(where('userId', '==', filters.userId));
    if (filters?.status) constraints.push(where('status', '==', filters.status));

    constraints.push(orderBy('createdAt', 'desc'));

    if (constraints.length === 1) {
      q = query(collection(requireDb(), 'reports'), constraints[0]);
    } else if (constraints.length > 1) {
      q = query(collection(requireDb(), 'reports'), ...constraints);
    } else {
      q = query(collection(requireDb(), 'reports'), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// ==================== UPLOADS COLLECTION ====================

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileRef = ref(requireStorage(), path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const addUpload = async (uploadData: any) => {
  try {
    const docRef = await addDoc(collection(requireDb(), 'uploads'), {
      ...uploadData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding upload record:', error);
    throw error;
  }
};

export const getUploads = async (userId?: string) => {
  try {
    let q: Query;
    if (userId) {
      q = query(
        collection(requireDb(), 'uploads'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(requireDb(), 'uploads'), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching uploads:', error);
    throw error;
  }
};

// ==================== TRUCKS COLLECTION ====================

export const addTruck = async (truckData: any) => {
  try {
    const docRef = await addDoc(collection(requireDb(), 'trucks'), {
      ...truckData,
      createdAt: Timestamp.now(),
      status: 'available',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding truck:', error);
    throw error;
  }
};

export const getTrucks = async () => {
  try {
    const q = query(collection(requireDb(), 'trucks'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching trucks:', error);
    throw error;
  }
};

export const updateTruck = async (truckId: string, updates: any) => {
  try {
    await updateDoc(doc(requireDb(), 'trucks', truckId), updates);
  } catch (error) {
    console.error('Error updating truck:', error);
    throw error;
  }
};

// ==================== COMMUNITY POSTS COLLECTION ====================

export const addPost = async (postData: any) => {
  try {
    const docRef = await addDoc(collection(requireDb(), 'communityPosts'), {
      ...postData,
      createdAt: Timestamp.now(),
      likes: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding post:', error);
    throw error;
  }
};

export const getPosts = async () => {
  try {
    const q = query(collection(requireDb(), 'communityPosts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(requireDb(), 'communityPosts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};
