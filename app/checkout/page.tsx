"use client";

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';
import { Footer } from '../components/Footer';

const MESSENGER_LINK = 'https://m.me/nurudeen.alabi.752';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user, refreshUsers } = useAuth();
  
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'messenger' | 'phone'>('whatsapp');
  const [savedOrderDetails, setSavedOrderDetails] = useState<{
    name: string;
    address: string;
    total: number;
    itemsSummary: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const itemsSummary = items
      .map((i) => `• ${i.quantity}x ${i.product.name} ($${(i.product.price * i.quantity).toFixed(2)})`)
      .join('\n');

    setSavedOrderDetails({
      name: form.name,
      address: form.address,
      total,
      itemsSummary,
    });

    const addressInfo = form.address?.trim() ? `\n📍 *Address:* ${form.address.trim()}` : '';
    const orderMsg = `Hello Deen's Daily Hub! I just placed an order:\n\n👤 *Username:* ${form.name}\n📱 *Phone:* ${form.phone}${addressInfo}\n\n🛍️ *Items:*\n${itemsSummary}\n\n💰 *Total:* $${total.toFixed(2)}\n\nPlease confirm availability and dispatch!`;

    const redirectUrl =
      contactMethod === 'messenger'
        ? MESSENGER_LINK
        : WHATSAPP_NUMBER
        ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(orderMsg)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(orderMsg)}`;

    // Sync ordered items to customer record in MongoDB Atlas for Admin Dashboard
    try {
      const itemsToRecord = items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || `user_${form.phone.replace(/\D/g, '') || Date.now()}@deensdaily.local`,
          phone: form.phone,
          contactMethod,
          registeredItems: itemsToRecord,
        }),
      });

      await refreshUsers();
    } catch (err) {
      console.error('Failed to sync order items to database:', err);
    }

    clearCart();
    setOrderComplete(true);
    setIsSubmitting(false);

    // Automatically navigate / open WhatsApp or Messenger based on user choice
    if (typeof window !== 'undefined') {
      window.open(redirectUrl, '_blank');
    }
  };

  const whatsappOrderUrl = savedOrderDetails
    ? (WHATSAPP_NUMBER
        ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Hello Deen's Daily Hub! I just placed an order:\n\n👤 *Username:* ${savedOrderDetails.name}${savedOrderDetails.address ? `\n📍 *Address:* ${savedOrderDetails.address}` : ''}\n\n🛍️ *Items:*\n${savedOrderDetails.itemsSummary}\n\n💰 *Total:* $${savedOrderDetails.total.toFixed(2)}\n\nPlease confirm availability and dispatch!`
          )}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Hello Deen's Daily Hub! I just placed an order:\n\n👤 *Username:* ${savedOrderDetails.name}${savedOrderDetails.address ? `\n📍 *Address:* ${savedOrderDetails.address}` : ''}\n\n💰 *Total:* $${savedOrderDetails.total.toFixed(2)}\n\nPlease confirm dispatch!`
          )}`)
    : (WHATSAPP_NUMBER
        ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`
        : 'https://api.whatsapp.com');

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,29,72,0.18),_transparent_32%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        {/* Header Banner */}
        <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
                Secure Express Checkout
              </span>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl text-white">Complete Your Purchase</h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/20"
            >
              ← Back to Shop
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Review your order details below. Enter your delivery information to place your order with our store team.
          </p>
        </div>

        {items.length === 0 && !orderComplete ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-12 text-center text-slate-300 shadow-soft">
            <h2 className="text-2xl font-bold text-white">Your cart is currently empty</h2>
            <p className="mt-3 text-sm text-slate-400">Explore our catalog to select your favorite products.</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-lg shadow-brand-600/30"
            >
              Start Shopping Now
            </Link>
          </div>
        ) : orderComplete ? (
          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-emerald-500/30 bg-slate-900/90 p-8 text-center text-slate-300 shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl text-emerald-400">
                ✓
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-white">Order Successfully Placed!</h2>
              <p className="mt-3 text-sm max-w-xl mx-auto leading-6 text-slate-300">
                Thank you for your order, <span className="font-semibold text-white">{form.name}</span>. Your request has been recorded in our store dispatch queue.
              </p>

              {/* NEXT STEP: WHATSAPP & MESSENGER CONTACT */}
              <div className="mt-6 mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-left shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="text-base font-bold text-white">Order Confirmation & Dispatch</h3>
                    <p className="text-xs text-emerald-400">Direct Support via WhatsApp or Messenger</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your order has been recorded. We have opened your selected chat ({contactMethod === 'messenger' ? 'Messenger' : 'WhatsApp'}) with your order details. If the chat window didn't open automatically, click below to connect with our dispatch team:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <a
                    href={whatsappOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30"
                  >
                    <span>💬 Chat on WhatsApp</span>
                    <span>→</span>
                  </a>
                  <a
                    href={MESSENGER_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-lg shadow-sky-600/30"
                  >
                    <span>⚡ Chat on Messenger</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-lg shadow-brand-600/30"
                >
                  Return to Storefront
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Customer Details Form */}
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white">1. Contact & Delivery Information</h2>
              <p className="mt-1 text-sm text-slate-400">Enter your details to confirm your order.</p>

              <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Username *
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        👤
                      </span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="e.g. Zakariyyah"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        📱
                      </span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                        placeholder="e.g. +2348012345678"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setContactMethod('whatsapp')}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-semibold transition ${
                        contactMethod === 'whatsapp'
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <span>💬</span>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod('messenger')}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-semibold transition ${
                        contactMethod === 'messenger'
                          ? 'border-sky-500/50 bg-sky-500/15 text-sky-300 shadow-md shadow-sky-500/10'
                          : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <span>⚡</span>
                      <span>Messenger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod('phone')}
                      className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-semibold transition ${
                        contactMethod === 'phone'
                          ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <span>📱</span>
                      <span>Call / SMS</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Address (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Delivery / Pickup Address
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">(Optional)</span>
                  </div>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Street address, City, Area (or arrange with team in chat)"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Special Order Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Specific delivery times, color choices, etc."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500 transition"
                  />
                </div>

                {/* ORDER SUBMISSION NOTICE */}
                <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs text-sky-200">
                  <p className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <span>💡</span> Order Confirmation Process
                  </p>
                  <p className="text-slate-300">
                    Your order will be instantly submitted to our dispatch team. We will verify your items and reach out directly with payment and dispatch details.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition disabled:opacity-60 shadow-xl ${
                    contactMethod === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : contactMethod === 'messenger'
                      ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
                  }`}
                >
                  {isSubmitting ? (
                    <span>⏳ Processing Order & Connecting...</span>
                  ) : contactMethod === 'whatsapp' ? (
                    <span>💬 Place Order via WhatsApp • ${total.toFixed(2)} →</span>
                  ) : contactMethod === 'messenger' ? (
                    <span>⚡ Place Order via Messenger • ${total.toFixed(2)} →</span>
                  ) : (
                    <span>🛍️ Place Order • ${total.toFixed(2)} →</span>
                  )}
                </button>
              </form>
            </section>

            {/* Order Items & Price Summary Sidebar */}
            <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md h-fit">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400">Order Summary</span>
                <h2 className="mt-1 text-2xl font-bold text-white">{itemCount} {itemCount === 1 ? 'Item' : 'Items'} Selected</h2>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 p-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{item.product.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.quantity} × ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-white font-mono">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery / Shipping</span>
                  <span className="text-emerald-400 font-semibold text-xs">
                    Discussed in Chat
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                  <span>Items Total</span>
                  <span className="text-xl font-mono text-emerald-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
