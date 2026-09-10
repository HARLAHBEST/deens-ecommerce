"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type RegisteredItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
};

export type UserAccount = {
  id: number;
  name: string;
  email?: string;
  phone: string;
  contactMethod?: 'messenger' | 'phone' | 'whatsapp';
  password?: string;
  createdAt: string;
  registeredItems?: RegisteredItem[];
};

type RegisterPayload = {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  contactMethod?: 'messenger' | 'phone' | 'whatsapp';
};

type AuthProviderValue = {
  user: UserAccount | null;
  users: UserAccount[];
  isAuthenticated: boolean;
  refreshUsers: () => Promise<void>;
  register: (
    payload: RegisterPayload,
    registeredItems?: RegisteredItem[]
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    identifier: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteUser: (id: number) => Promise<void>;
};

const AuthContext = createContext<AuthProviderValue | undefined>(undefined);
const ACTIVE_USER_SESSION_KEY = 'deensdaily-active-user';

function buildOptimisticUser(
  payload: RegisterPayload,
  registeredItems?: RegisteredItem[]
): UserAccount {
  return {
    id: Math.floor(Math.random() * 90000) + 10000,
    name: payload.name,
    phone: payload.phone,
    email: payload.email || `user_${payload.phone.replace(/\D/g, '')}@deensdaily.local`,
    contactMethod: payload.contactMethod || 'messenger',
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
  const [user, setUser] = useState<UserAccount | null>(null);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {}
  };

  // Restore session from localStorage + load users from DB
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ACTIVE_USER_SESSION_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    refreshUsers();
  }, []);

  const register = async (
    payload: RegisterPayload,
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
          const exists = prev.some((u) => u.phone === data.user.phone);
          return exists
            ? prev.map((u) => (u.phone === data.user.phone ? data.user : u))
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

  const login = async (identifier: string, password?: string) => {
    try {
      // Call the login API for proper server-side authentication
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier.trim(), password: password || '' }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        saveSession(data.user);
        setUsers((prev) => {
          const exists = prev.some((u) => u.id === data.user.id);
          return exists
            ? prev.map((u) => (u.id === data.user.id ? data.user : u))
            : [data.user, ...prev];
        });
        return { success: true };
      }

      return { success: false, error: data.error || 'Login failed.' };
    } catch (err: any) {
      // Offline fallback: try in-memory lookup
      const cleanId = identifier.trim().toLowerCase();
      const cleanDigits = identifier.replace(/\D/g, '');
      const found = users.find(
        (u) =>
          u.name.toLowerCase() === cleanId ||
          u.phone.toLowerCase() === cleanId ||
          (cleanDigits.length >= 6 && u.phone.replace(/\D/g, '').includes(cleanDigits))
      );

      if (found) {
        setUser(found);
        saveSession(found);
        return { success: true };
      }

      return { success: false, error: err?.message || 'Login failed. Please check your connection.' };
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
    () => ({
      user,
      users,
      isAuthenticated: Boolean(user),
      refreshUsers,
      register,
      login,
      logout,
      deleteUser,
    }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
