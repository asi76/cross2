import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
// Reuse the same app, db, storage from firebase.ts
import { app, db, storage } from '../firebase';
import { pb } from '../pbService';

export { app, db, storage };
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = 'asi.vong@gmail.com';

// PocketBase user profile operations
async function getUserProfile(email: string) {
  try {
    const records = await pb.collection('user_profiles').getFullList({
      filter: `email = '${email.toLowerCase()}'`,
    });
    return records.length > 0 ? records[0] : null;
  } catch {
    return null;
  }
}

async function saveUserProfile(email: string, data: any) {
  try {
    const existing = await getUserProfile(email);
    if (existing) {
      await pb.collection('user_profiles').update(existing.id, data);
    } else {
      await pb.collection('user_profiles').create({
        email: email.toLowerCase(),
        ...data
      });
    }
  } catch (e) {
    console.error('Error saving user profile to PocketBase:', e);
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserRole = async (email: string): Promise<string | null> => {
  // Try PocketBase first
  try {
    const profile = await getUserProfile(email);
    if (profile) {
      return profile.role || 'pending';
    }
  } catch {
    // Fallback to Firebase
  }
  
  // Fallback to Firebase
  const lowerEmail = email.toLowerCase();
  const userDoc = await getDoc(doc(db, 'users', lowerEmail));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  const userDoc2 = await getDoc(doc(db, 'users', email));
  if (userDoc2.exists()) {
    return userDoc2.data().role;
  }
  return null;
};

export const createPendingUser = async (user: User, message?: string): Promise<void> => {
  // Save to PocketBase
  await saveUserProfile(user.email!, {
    role: 'pending',
    name: user.displayName || 'Unknown',
    message: message || '',
    requestedAt: new Date().toISOString()
  });
  
  // Also keep in Firebase for backwards compatibility
  const userRef = doc(db, 'users', user.email!);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      role: 'pending',
      requestedAt: serverTimestamp(),
      name: user.displayName || 'Unknown',
      email: user.email,
      photoURL: user.photoURL || null,
      message: message || '',
    });
  }
};

export const approveUser = async (email: string): Promise<void> => {
  // Update in PocketBase
  await saveUserProfile(email, {
    role: 'enabled',
    approvedAt: new Date().toISOString()
  });
  
  // Update in Firebase
  await updateDoc(doc(db, 'users', email), {
    role: 'enabled',
    approvedAt: serverTimestamp()
  });
};

export const rejectUser = async (email: string): Promise<void> => {
  // Delete from PocketBase
  try {
    const profile = await getUserProfile(email);
    if (profile) {
      await pb.collection('user_profiles').delete(profile.id);
    }
  } catch {
    // Ignore
  }
  
  // Delete from Firebase
  await deleteDoc(doc(db, 'users', email));
};

export const removeUser = async (email: string): Promise<void> => {
  // Delete from PocketBase
  try {
    const profile = await getUserProfile(email);
    if (profile) {
      await pb.collection('user_profiles').delete(profile.id);
    }
  } catch {
    // Ignore
  }
  
  // Delete from Firebase
  await deleteDoc(doc(db, 'users', email));
};

export const getPendingUsers = async (): Promise<any[]> => {
  // Get from PocketBase
  try {
    const records = await pb.collection('user_profiles').getFullList({
      filter: `role = 'pending'`,
    });
    if (records.length > 0) {
      return records.map(r => ({
        id: r.id,
        email: r.email,
        role: r.role,
        name: r.name || '',
        message: r.message || '',
        requestedAt: r.requestedAt ? { toDate: () => new Date(r.requestedAt) } : null
      }));
    }
  } catch {
    // Fallback to Firebase
  }
  
  // Fallback to Firebase
  const q = query(collection(db, 'users'), where('role', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEnabledUsers = async (): Promise<any[]> => {
  // Get from PocketBase
  try {
    const records = await pb.collection('user_profiles').getFullList({
      filter: `role = 'enabled'`,
    });
    if (records.length > 0) {
      return records.map(r => ({
        id: r.id,
        email: r.email,
        role: r.role,
        name: r.name || ''
      }));
    }
  } catch {
    // Fallback to Firebase
  }
  
  // Fallback to Firebase
  const q = query(collection(db, 'users'), where('role', '==', 'enabled'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export { onAuthStateChanged };
