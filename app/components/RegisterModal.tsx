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
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'messenger' | 'phone' | 'whatsapp'>('whatsapp');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and phone number.');
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

    const result = await register(
      { name: name.trim(), phone: phone.trim(), contactMethod },
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
      <div className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500 font-semibold">Quick Checkout</p>
            <h2 className="text-2xl font-bold text-white mt-1">Enter Your Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Selected Product Preview */}
        {pendingProduct && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3">
            <img
              src={pendingProduct.images?.[0] || pendingProduct.image}
              alt={pendingProduct.name}
              className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Selected Item</p>
              <h3 className="text-sm font-semibold text-white truncate">{pendingProduct.name}</h3>
              <p className="text-sm font-bold text-slate-200">${pendingProduct.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Name *</label>
            <input
              type="text"
              placeholder="e.g. Zakariyyah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              placeholder="e.g. +2348012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Contact Method Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">How should we contact you?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setContactMethod('whatsapp')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-semibold transition ${
                  contactMethod === 'whatsapp'
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <span className="text-base">💬</span>
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('messenger')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-semibold transition ${
                  contactMethod === 'messenger'
                    ? 'border-sky-500/50 bg-sky-500/15 text-sky-300 shadow-lg shadow-sky-500/10'
                    : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <span className="text-base">⚡</span>
                <span>Messenger</span>
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('phone')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-semibold transition ${
                  contactMethod === 'phone'
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-lg shadow-amber-500/10'
                    : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <span className="text-base">📱</span>
                <span>Call/SMS</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-lg shadow-brand-600/30 disabled:opacity-70"
            >
              {isSubmitting ? '✓ Processing...' : 'Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
