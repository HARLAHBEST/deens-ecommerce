"use client";

import type { Product } from '@/data/products';

const MESSENGER_LINK = process.env.NEXT_PUBLIC_MESSENGER_LINK || 'https://m.me/nurudeen.alabi.752';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '14385403074';

type BuyNowModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
};

export function BuyNowModal({ isOpen, product, onClose }: BuyNowModalProps) {
  if (!isOpen || !product) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello Deen's Daily Hub! I would like to order:\n\n🛍️ *${product.name}*\n💰 Price: $${product.price.toLocaleString()}\n📦 Category: ${product.category}\n\nPlease confirm availability and delivery details.`
  );

  const whatsappUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${whatsappMessage}`
    : `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-brand-500" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-400">
              Instant Order
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              Choose Order Method
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select WhatsApp or Messenger to connect directly with our dispatch team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition flex-shrink-0"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Selected Product Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 mb-6">
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-brand-400 font-semibold">
              {product.category}
            </span>
            <h3 className="text-sm font-bold text-white truncate mt-0.5">{product.name}</h3>
            <p className="text-base font-black text-emerald-400 mt-0.5">
              ${product.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Two Options: WhatsApp & Messenger */}
        <div className="space-y-3">
          {/* Option 1: WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex items-center gap-3.5 w-full rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 p-4 text-white transition shadow-lg shadow-emerald-600/25"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner">
              💬
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Order via WhatsApp</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                  Fastest
                </span>
              </div>
              <div className="text-xs text-emerald-100/80 mt-0.5">
                Chat directly with prefilled item details
              </div>
            </div>
            <span className="text-emerald-200 group-hover:translate-x-1 transition-transform text-lg">
              →
            </span>
          </a>

          {/* Option 2: Messenger */}
          <a
            href={MESSENGER_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex items-center gap-3.5 w-full rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 p-4 text-white transition shadow-lg shadow-sky-600/25"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner">
              ⚡
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Order via Messenger</span>
              </div>
              <div className="text-xs text-sky-100/80 mt-0.5">
                Live Facebook chat with our store dispatch
              </div>
            </div>
            <span className="text-sky-200 group-hover:translate-x-1 transition-transform text-lg">
              →
            </span>
          </a>
        </div>

        {/* Reassurance text */}
        <p className="mt-5 text-center text-[11px] text-slate-400 leading-relaxed">
          🔒 Secure direct ordering. No upfront credit card required — our team will confirm your order and delivery arrangements.
        </p>
      </div>
    </div>
  );
}
