"use client";

import { useState } from 'react';
import type { Product } from '@/data/products';
import { useAuth } from '../providers/AuthProvider';

type RegisterModalProps = {
  isOpen: boolean;
  pendingProduct: Product | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function RegisterModal({ isOpen, pendingProduct, onClose, onSuccess }: RegisterModalProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);

    const itemsToAttach = pendingProduct
      ? [
          {
            productId: pendingProduct.id,
            productName: pendingProduct.name,
            price: pendingProduct.price,
            quantity: 1,
          },
        ]
      : [];

    // register() is now optimistic — returns immediately, syncs to DB in background
    const result = await register(
      { name, email, phone, password: password || 'default123' },
      itemsToAttach
    );

    if (!result.success) {
      setError(result.error || 'Failed to register.');
      setIsSubmitting(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500 font-semibold">Quick Registration</p>
            <h2 className="text-2xl font-bold text-white mt-1">Join to Add to Cart</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {pendingProduct && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3">
            <img
              src={pendingProduct.image}
              alt={pendingProduct.name}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Selected Item</p>
              <h3 className="text-sm font-semibold text-white truncate">{pendingProduct.name}</h3>
              <p className="text-sm font-bold text-slate-200">${pendingProduct.price.toFixed(2)}</p>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Please enter your details to create an account. Your item will be added to your cart immediately upon registration.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password (Optional)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-lg shadow-brand-600/30 disabled:opacity-70"
            >
              {isSubmitting ? '✓ Registering...' : 'Register & Add to Cart'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
