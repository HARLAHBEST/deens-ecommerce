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
  refreshUsers: () => Promise<void>;
  register: (
    payload: Omit<UserAccount, 'id' | 'createdAt'>,
    registeredItems?: RegisteredItem[]
  ) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteUser: (id: number) => Promise<void>;
};

const AuthContext = createContext<AuthProviderValue | undefined>(undefined);
const ACTIVE_USER_SESSION_KEY = 'deensdaily-active-user';

function buildOptimisticUser(
  payload: Omit<UserAccount, 'id' | 'createdAt'>,
  registeredItems?: RegisteredItem[]
): UserAccount {
  return {
    id: Math.floor(Math.random() * 90000) + 10000,
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: payload.phone || '',
    password: payload.password,
    createdAt: new Date().toISOString(),
    registeredItems: registeredItems || [],
  };
}

function saveSession(user: UserAccount) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(user));
    }
  } catch {}
}

function clearSession() {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [user, setUser] = useState<UserAccount | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(ACTIVE_USER_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {}
  };

  // Load users from DB in background
  useEffect(() => {
    refreshUsers();
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
          registeredItems: registeredItems || [],
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        saveSession(data.user);
        setUsers((prev) => {
          const exists = prev.some((u) => u.email === data.user.email);
          return exists
            ? prev.map((u) => (u.email === data.user.email ? data.user : u))
            : [data.user, ...prev];
        });
        return { success: true };
      }
    } catch {
      // Fallback for offline usage
    }

    // Offline / Fallback User
    const optimisticUser = buildOptimisticUser(payload, registeredItems);
    setUser(optimisticUser);
    saveSession(optimisticUser);
    setUsers((prev) => [optimisticUser, ...prev]);

    return { success: true };
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
        saveSession(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Incorrect email or password.' };
      }
    } catch {
      return { success: false, error: 'Unable to connect. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  const deleteUser = async (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const value = useMemo(
    () => ({ user, users, isAuthenticated: Boolean(user), refreshUsers, register, login, logout, deleteUser }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
