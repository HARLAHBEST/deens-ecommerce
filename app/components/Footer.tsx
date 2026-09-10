"use client";

import Link from 'next/link';

const MESSENGER_LINK = "https://m.me/nurudeen.alabi.752";
const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, '')}?text=Hello%20Deen%27s%20Daily%20Hub%2C%20I%20have%20an%20inquiry%20about%20your%20products`
  : 'https://api.whatsapp.com/send?text=Hello%20Deen%27s%20Daily%20Hub%2C%20I%20have%20an%20inquiry%20about%20your%20products';

export function Footer({ onCategoryClick }: { onCategoryClick?: (category: string) => void }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 text-slate-400">
      {/* Trust & Guarantee Highlights Bar */}
      <div className="border-b border-white/5 bg-slate-900/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4 transition hover:border-brand-500/30">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-400 text-xl border border-brand-500/20">
                ⚡
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Fast Dispatch</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Swift handling and reliable delivery straight to your doorstep.
                </p>
              </div>
            </div>

            {/* Feature 2: WhatsApp & Messenger */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4 transition hover:border-emerald-500/30">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-xl border border-emerald-500/20">
                💬
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">WhatsApp & Messenger</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Instant live chat, quick item queries, and real-time order updates.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4 transition hover:border-emerald-500/30">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-xl border border-emerald-500/20">
                🛡️
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Quality Guarantee</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Every product is inspected before packaging for complete satisfaction.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4 transition hover:border-amber-500/30">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 text-xl border border-amber-500/20">
                🤝
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Payment Flexibility</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Direct transfer or payment upon confirmation for smooth orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col (Spans 2 columns) */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-black text-lg shadow-md shadow-brand-600/30 group-hover:scale-105 transition">
                D
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition">
                  Deen's Daily Hub
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Quality Everyday Essentials</p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your premier destination for handpicked electronics, lifestyle gear, and daily convenience items. Built to make ordering effortless and reliable.
            </p>

            {/* Two Chat Buttons: WhatsApp and Messenger */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition"
              >
                <span>💬 WhatsApp</span>
                <span>→</span>
              </a>
              <a
                href={MESSENGER_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 transition"
              >
                <span>⚡ Messenger</span>
                <span>→</span>
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Customer Support Active (8:00 AM – 10:00 PM)</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Popular Collections
            </h4>
            <ul className="space-y-2 text-xs">
              {['Smart Gadgets', 'Home Essentials', 'Fashion & Style', 'Audio & Sound', 'Daily Deals'].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onCategoryClick ? onCategoryClick(cat) : undefined}
                    className="hover:text-brand-400 transition hover:translate-x-1 inline-block"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition flex items-center gap-1.5"
                >
                  <span>💬</span> Live Chat on WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={MESSENGER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-300 transition flex items-center gap-1.5"
                >
                  <span>⚡</span> Live Chat on Messenger
                </a>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-slate-200 transition">
                  Order Status & Checkout
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Doorstep Delivery Terms</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Warranty & Returns Policy</span>
              </li>
            </ul>
          </div>

          {/* Account & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Account & Store
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-brand-400 transition">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-400 transition">
                  Create New Account
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-slate-200 transition">
                  View Shopping Cart
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter / Stay Connected Banner */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white">Never Miss Exclusive Deals & Restocks</h4>
            <p className="text-xs text-slate-400">
              Get instant alerts on flash sales and special discounts via WhatsApp or Messenger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <span>💬 Join WhatsApp VIP</span>
            </a>
            <a
              href={MESSENGER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-md shadow-sky-600/30 flex items-center gap-1.5"
            >
              <span>⚡ Join Messenger VIP</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal, Copyright & Badges */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p>© {currentYear} <span className="text-slate-300 font-semibold">Deen's Daily Hub</span>. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Reliable shopping & express dispatch.</p>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>🔒</span> Safe & Encrypted Checkout
            </span>
            <span className="text-slate-800">•</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>📦</span> Verified Parcel Inspection
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
