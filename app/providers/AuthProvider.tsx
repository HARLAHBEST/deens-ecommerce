"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type RegisteredItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
};

export type UserAccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: string;
  registeredItems?: RegisteredItem[];
};

type AuthProviderValue = {
  user: UserAccount | null;
  users: UserAccount[];
  isAuthenticated: boolean;
  register: (
    payload: Omit<UserAccount, 'id' | 'createdAt'>,
    registeredItems?: RegisteredItem[]
  ) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthProviderValue | undefined>(undefined);
const ACTIVE_USER_SESSION_KEY = 'deensdaily-active-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [user, setUser] = useState<UserAccount | null>(null);

  // Fetch all registered users from MongoDB
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users from MongoDB:', err);
    }
  };

  useEffect(() => {
    fetchUsers();

    if (typeof window !== 'undefined') {
      try {
        const storedActiveUser = window.localStorage.getItem(ACTIVE_USER_SESSION_KEY);
        if (storedActiveUser) {
          setUser(JSON.parse(storedActiveUser));
        }
      } catch (err) {
        console.error('Error reading session active user:', err);
      }
    }
  }, []);

  const register = async (
    payload: Omit<UserAccount, 'id' | 'createdAt'>,
    registeredItems?: RegisteredItem[]
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          registeredItems: registeredItems || payload.registeredItems || [],
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(data.user));
        }
        await fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to register.' };
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      return { success: false, error: err.message || 'Server error during registration.' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(data.user));
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to sign in.' };
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      return { success: false, error: err.message || 'Server error during sign in.' };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
    }
  };

  const value = useMemo(
    () => ({
      user,
      users,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
    }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
