import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithGoogle, 
  logOut, 
  getUserRole, 
  createPendingUser,
  ADMIN_EMAIL,
  auth 
} from '../firebase/auth';

export type UserRole = 'admin' | 'enabled' | 'pending' | null;

interface UseAuthReturn {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
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
    
    // Admin always has access
    if (user.email === ADMIN_EMAIL) {
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
      // On error, default to pending
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

  const signIn = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      setUser(firebaseUser);
      
      // Admin always has access
      if (firebaseUser.email === ADMIN_EMAIL) {
        setRole('admin');
        return;
      }
      
      // Check if user exists in Firestore
      const userRole = await getUserRole(firebaseUser.email!);
      
      if (userRole === 'enabled' || userRole === 'admin') {
        setRole(userRole);
      } else {
        // New user - create pending request
        try {
          await createPendingUser(firebaseUser);
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
