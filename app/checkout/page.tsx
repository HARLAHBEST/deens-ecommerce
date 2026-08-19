"use client";

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user, refreshUsers } = useAuth();
  
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleSendToWhatsApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const orderLines = items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} ($${item.product.price.toFixed(2)} ea)`
      )
      .join('%0A');

    const message = `Hello Deen's Daily Hub! 👋%0A%0AI would like to place an order:%0A%0A🛍️ ORDER ITEMS:%0A${orderLines}%0A%0A💰 TOTAL AMOUNT: $${total.toFixed(2)}%0A%0A👤 CUSTOMER DETAILS:%0A• Name: ${form.name}%0A• Email: ${form.email}%0A• Phone: ${form.phone || 'N/A'}%0A• Delivery Address: ${form.address}%0A• Notes: ${form.notes || 'None'}%0A%0APlease confirm my order and send your account details here on WhatsApp so I can make payment. Thank you!`;

    const adminPhone = '14385403074';
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;

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
          email: form.email,
          phone: form.phone,
          registeredItems: itemsToRecord,
        }),
      });

      await refreshUsers();
    } catch (err) {
      console.error('Failed to sync order items to database:', err);
    }

    window.open(whatsappUrl, '_blank');
    clearCart();
    setOrderComplete(true);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,29,72,0.18),_transparent_32%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        {/* Header Banner */}
        <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                Direct WhatsApp Checkout
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
            Review your order details below. Click "Proceed to WhatsApp" to send your order directly to our store admin and receive bank payment instructions directly on WhatsApp.
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
              <h2 className="mt-4 text-3xl font-extrabold text-white">Order Sent via WhatsApp!</h2>
              <p className="mt-3 text-sm max-w-xl mx-auto leading-6 text-slate-300">
                Your order has been opened in WhatsApp. Please send the message to complete your submission.
              </p>

              {/* NEXT STEP DIRECT ON WHATSAPP */}
              <div className="mt-6 mx-auto max-w-xl rounded-3xl border border-emerald-500/20 bg-slate-950/80 p-6 text-left shadow-2xl space-y-3">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="text-base font-bold text-white">Next Step on WhatsApp</h3>
                    <p className="text-xs text-emerald-400">Direct Payment & Dispatch Confirmation</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  We have prepared your order message. Our store admin will respond to your message on WhatsApp and send our official bank account payment details directly to you there.
                </p>
                <p className="text-xs text-slate-400">
                  Once payment is completed, kindly reply with your transfer receipt on WhatsApp for instant dispatch.
                </p>
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
              <p className="mt-1 text-sm text-slate-400">Enter your details to generate your WhatsApp order message.</p>

              <form onSubmit={handleSendToWhatsApp} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g. Alex Johnson"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="alex@example.com"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                      placeholder="+1 234 567 8900"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Delivery / Pickup Address *
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    required
                    placeholder="Street address, City, Postal Code"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-500 transition"
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

                {/* WHATSAPP ORDER NOTICE */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
                  <p className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <span>💡</span> WhatsApp Checkout Process
                  </p>
                  <p className="text-slate-300">
                    When you click below, your order will open directly on WhatsApp. The store admin will receive your item list and reply with payment account details directly on WhatsApp.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 shadow-xl shadow-emerald-600/30"
                >
                  <span>{isSubmitting ? '⏳ Processing Order...' : `📱 Proceed to WhatsApp Order • $${total.toFixed(2)}`}</span>
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
                  <span className="font-mono text-emerald-400">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-xl font-mono text-emerald-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
