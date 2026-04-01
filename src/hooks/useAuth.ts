import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithGoogle, 
  logOut, 
  createPendingUser,
  ADMIN_EMAIL,
  auth,
  getUserRole as getUserRoleFromFirebase
} from '../firebase/auth';
import { pb } from '../pbService';

export type UserRole = 'admin' | 'enabled' | 'pending' | null;

interface UseAuthReturn {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (requestEmail?: string, requestMessage?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

// Get user role from PocketBase
async function getUserRole(email: string): Promise<'enabled' | 'pending' | null> {
  try {
    const records = await pb.collection('user_profiles').getFullList({
      filter: `email = '${email.toLowerCase()}'`,
    });
    if (records.length > 0) {
      return records[0].role || 'pending';
    }
    return null;
  } catch {
    // Fallback to Firebase
    return getUserRoleFromFirebase(email);
  }
}

// Save user to PocketBase
async function saveUserToPocketBase(email: string, role: string, extraData: any = {}) {
  try {
    const existing = await pb.collection('user_profiles').getFullList({
      filter: `email = '${email.toLowerCase()}'`,
    });
    
    if (existing.length > 0) {
      await pb.collection('user_profiles').update(existing[0].id, {
        role,
        ...extraData
      });
    } else {
      await pb.collection('user_profiles').create({
        email: email.toLowerCase(),
        role,
        name: extraData.name || '',
        ...extraData
      });
    }
  } catch (e) {
    console.error('Error saving user to PocketBase:', e);
  }
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (user: User | null) => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    
    // Admin always has access (case-insensitive)
    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setRole('admin');
      setLoading(false);
      return;
    }
    
    try {
      const userRole = await getUserRole(user.email!);
      
      if (userRole === 'enabled' || userRole === 'admin') {
        setRole(userRole);
      } else {
        // User not enabled - set to pending
        setRole('pending');
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      setRole('pending');
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await fetchRole(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (requestEmail?: string, requestMessage?: string) => {
    try {
      // If email and message provided (Request Access flow), save pending request to PocketBase BEFORE auth
      if (requestEmail && requestMessage) {
        try {
          await saveUserToPocketBase(requestEmail, 'pending', {
            name: requestEmail.split('@')[0],
            message: requestMessage,
            requestedAt: new Date().toISOString()
          });
        } catch (e) {
          console.error('Error saving pending request:', e);
        }
      }
      
      const firebaseUser = await signInWithGoogle();
      setUser(firebaseUser);
      
      // Admin always has access (case-insensitive)
      if (firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setRole('admin');
        return;
      }
      
      // Check if user exists in PocketBase
      const userRole = await getUserRole(firebaseUser.email!);
      
      if (userRole === 'enabled' || userRole === 'admin') {
        setRole(userRole);
      } else {
        // New user - create pending request
        try {
          await saveUserToPocketBase(firebaseUser.email!, 'pending', {
            name: firebaseUser.displayName || '',
          });
        } catch (e) {
          console.error('Error creating pending user:', e);
        }
        setRole('pending');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await logOut();
    setUser(null);
    setRole(null);
  };

  const refreshRole = async () => {
    if (user) {
      await fetchRole(user);
    }
  };

  return { user, role, loading, signIn, signOut, refreshRole };
};
