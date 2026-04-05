import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
// Reuse the same app, db, storage from firebase.ts
import { app, db, storage } from '../firebase';
import { pb } from '../pbService';
import { notifyAdminOfAccessRequest } from '../lib/accessRequestApi';

export { app, db, storage };
export const auth = getAuth(app);

export const ADMIN_EMAIL = 'asi.vong@gmail.com';
export const APP_ACCESS_SLUG = 'crossplanner';

const normalizeApps = (source: any): string[] => {
  const values = [
    ...(Array.isArray(source?.apps) ? source.apps : []),
    ...(Array.isArray(source?.allowedApps) ? source.allowedApps : []),
    ...(Array.isArray(source?.app_access) ? source.app_access : []),
  ];

  return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)));
};

const hasAppAccess = (source: any) => {
  const apps = normalizeApps(source);
  if (apps.length === 0) {
    return true;
  }
  return apps.includes(APP_ACCESS_SLUG);
};

const buildGoogleProvider = (forceSelectAccount = false) => {
  const provider = new GoogleAuthProvider();
  if (forceSelectAccount) {
    provider.setCustomParameters({ prompt: 'select_account' });
  }
  return provider;
};

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

export const signInWithGoogle = async (forceSelectAccount = false): Promise<User> => {
  const result = await signInWithPopup(auth, buildGoogleProvider(forceSelectAccount));
  return result.user;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserRole = async (email: string): Promise<string | null> => {
  // Try PocketBase first
  try {
    const profile = await getUserProfile(email);
    if (profile && hasAppAccess(profile)) {
      return profile.role || 'pending';
    }
  } catch {
    // Fallback to Firebase
  }
  
  // Fallback to Firebase
  const lowerEmail = email.toLowerCase();
  const userDoc = await getDoc(doc(db, 'users', lowerEmail));
  if (userDoc.exists() && hasAppAccess(userDoc.data())) {
    return userDoc.data().role;
  }
  const userDoc2 = await getDoc(doc(db, 'users', email));
  if (userDoc2.exists() && hasAppAccess(userDoc2.data())) {
    return userDoc2.data().role;
  }
  return null;
};

export const createPendingUser = async (user: User, message?: string): Promise<void> => {
  if (!user.email) {
    throw new Error('Google account email missing');
  }

  // Save to PocketBase
  await saveUserProfile(user.email!, {
    role: 'pending',
    apps: [APP_ACCESS_SLUG],
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
      apps: [APP_ACCESS_SLUG],
      requestedAt: serverTimestamp(),
      name: user.displayName || 'Unknown',
      email: user.email,
      photoURL: user.photoURL || null,
      message: message || '',
    });
  }
};

export const createPendingAccessRequest = async (data: {
  email: string;
  name?: string;
  photoURL?: string | null;
  message?: string;
}): Promise<{ emailSent: boolean }> => {
  const normalizedEmail = data.email.toLowerCase();

  await saveUserProfile(normalizedEmail, {
    role: 'pending',
    apps: [APP_ACCESS_SLUG],
    name: data.name || normalizedEmail.split('@')[0],
    photoURL: data.photoURL || null,
    message: data.message || '',
    requestedAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'users', normalizedEmail), {
    role: 'pending',
    apps: [APP_ACCESS_SLUG],
    requestedAt: serverTimestamp(),
    name: data.name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    photoURL: data.photoURL || null,
    message: data.message || '',
  }, { merge: true });

  try {
    await notifyAdminOfAccessRequest({
      email: normalizedEmail,
      name: data.name || normalizedEmail.split('@')[0],
      message: data.message || '',
    });
    return { emailSent: true };
  } catch (error) {
    console.error('Access request email failed:', error);
    return { emailSent: false };
  }
};

export const approveUser = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase();

  // Update in PocketBase
  await saveUserProfile(normalizedEmail, {
    role: 'enabled',
    apps: [APP_ACCESS_SLUG],
    approvedAt: new Date().toISOString()
  });
  
  // Upsert in Firebase so approval works even if the pending request exists only in PocketBase.
  await setDoc(doc(db, 'users', normalizedEmail), {
    email: normalizedEmail,
    role: 'enabled',
    apps: [APP_ACCESS_SLUG],
    approvedAt: serverTimestamp()
  }, { merge: true });
};

export const rejectUser = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase();
  // Delete from PocketBase
  try {
    const profile = await getUserProfile(normalizedEmail);
    if (profile) {
      await pb.collection('user_profiles').delete(profile.id);
    }
  } catch {
    // Ignore
  }
  
  // Delete from Firebase
  await deleteDoc(doc(db, 'users', normalizedEmail));
};

export const removeUser = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase();
  // Delete from PocketBase
  try {
    const profile = await getUserProfile(normalizedEmail);
    if (profile) {
      await pb.collection('user_profiles').delete(profile.id);
    }
  } catch {
    // Ignore
  }
  
  // Delete from Firebase
  await deleteDoc(doc(db, 'users', normalizedEmail));
};

export const getPendingUsers = async (): Promise<any[]> => {
  // Get from PocketBase
  try {
    const records = await pb.collection('user_profiles').getFullList({
      filter: `role = 'pending'`,
    });
    if (records.length > 0) {
      return records
      .filter(r => hasAppAccess(r))
      .map(r => ({
        id: r.email || r.id,
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
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(hasAppAccess);
};

export const getEnabledUsers = async (): Promise<any[]> => {
  // Get from PocketBase
  try {
    const records = await pb.collection('user_profiles').getFullList({
      filter: `role = 'enabled'`,
    });
    if (records.length > 0) {
      return records
      .filter(r => hasAppAccess(r))
      .map(r => ({
        id: r.email || r.id,
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
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(hasAppAccess);
};

export { onAuthStateChanged };
