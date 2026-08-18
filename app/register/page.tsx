"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const { items } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/checkout');
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const itemsToAttach = items.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));

    const result = await register({ name, email, phone, password }, itemsToAttach);
    if (!result.success) {
      setError(result.error ?? 'Unable to create account.');
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
              <p className="text-sm uppercase tracking-[0.3em] text-brand-500">New account</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Register to place orders.</h1>
            </div>
            <Link href="/login" className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              Sign in instead
            </Link>
          </div>
          <p className="mt-4 text-slate-400">Create an account so you can checkout securely and keep your order details ready.</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-900/75 p-8 shadow-soft">
          {error ? <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
          <label className="block text-sm text-slate-200">
            Full name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500"
            />
          </label>
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
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <label className="block text-sm text-slate-200">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-brand-500"
              />
            </label>
          </div>
          <button type="submit" className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            Create account
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
