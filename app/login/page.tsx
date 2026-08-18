"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/checkout');
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error ?? 'Unable to sign in.');
      return;
    }

    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Sign in to complete your order.</h1>
            </div>
            <Link href="/register" className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
              Create account
            </Link>
          </div>
          <p className="mt-4 text-slate-400">Login to view your cart, proceed to checkout, and send your order through WhatsApp.</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-900/75 p-8 shadow-soft">
          {error ? <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
          <label className="block text-sm text-slate-200">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500"
            />
          </label>
          <label className="block text-sm text-slate-200">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500"
            />
          </label>
          <button type="submit" className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            Sign in
          </button>
          <p className="text-center text-sm text-slate-400">
            New here?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-200">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
