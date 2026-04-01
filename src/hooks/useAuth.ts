import { useState, useEffect, useCallback } from 'react';
import { login, logout, getUser, onAuthChange, upsertProfile, getProfile } from '../pbService';

export type UserRole = 'admin' | 'enabled' | 'pending' | null;

interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  role?: 'admin' | 'enabled' | 'pending' | 'user';
}

interface UseAuthReturn {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const ADMIN_EMAIL = 'jarvis.vong@gmail.com';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (u: User) => {
    if (u.email === ADMIN_EMAIL) {
      setRole('admin');
      return;
    }
    try {
      const profile = await getProfile(u.id);
      if (profile) {
        setRole(profile.role || 'enabled');
      } else {
        setRole('pending');
      }
    } catch {
      setRole('pending');
    }
  }, []);

  useEffect(() => {
    const currentUser = getUser() as User | null;
    if (currentUser) {
      setUser(currentUser);
      loadRole(currentUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    onAuthChange(async (model) => {
      const u = model as User | null;
      setUser(u);
      if (u) {
        await loadRole(u);
        await upsertProfile(u.id, u.email || 'User');
      } else {
        setRole(null);
      }
    });
  }, [loadRole]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    logout();
    setUser(null);
    setRole(null);
  };

  const refreshRole = async () => {
    if (user) await loadRole(user);
  };

  return { user, role, loading, signIn, signOut: handleSignOut, refreshRole };
};
