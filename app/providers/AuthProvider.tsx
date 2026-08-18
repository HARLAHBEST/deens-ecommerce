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

  // Load users from DB in background (admin dashboard only)
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch(() => {}); // fail silently
  }, []);

  const register = async (
    payload: Omit<UserAccount, 'id' | 'createdAt'>,
    registeredItems?: RegisteredItem[]
  ) => {
    // STEP 1: Optimistically log the user in immediately — no waiting
    const optimisticUser = buildOptimisticUser(payload, registeredItems);
    setUser(optimisticUser);
    saveSession(optimisticUser);

    // STEP 2: Sync to MongoDB in background (non-blocking)
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        registeredItems: registeredItems || [],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          // Update with the real DB user (has proper id, _id, createdAt)
          setUser(data.user);
          saveSession(data.user);
          setUsers((prev) => {
            const exists = prev.some((u) => u.email === data.user.email);
            return exists ? prev.map((u) => (u.email === data.user.email ? data.user : u)) : [data.user, ...prev];
          });
        }
      })
      .catch(() => {}); // fail silently — optimistic user already set

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

  const value = useMemo(
    () => ({ user, users, isAuthenticated: Boolean(user), register, login, logout }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
