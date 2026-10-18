"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/data/products';

const WHATSAPP_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '14385403074';
const WHATSAPP_NUMBER = WHATSAPP_RAW.replace(/\D/g, '');

type ProductImageModalProps = {
  isOpen: boolean;
  product: Product | null;
  initialIndex?: number;
  onClose: () => void;
  onAddToCart?: (id: number) => void;
  onBuyNow?: (product: Product) => void;
};

export function ProductImageModal({
  isOpen,
  product,
  initialIndex = 0,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, product]);

  // Keyboard navigation (Escape to close, arrows to flip images)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && imageList.length > 1) {
        setCurrentIndex((i) => (i + 1) % imageList.length);
      } else if (e.key === 'ArrowLeft' && imageList.length > 1) {
        setCurrentIndex((i) => (i - 1 + imageList.length) % imageList.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const imageList: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const currentImage = imageList[currentIndex] || product.image || '';

  const handleCopyLink = () => {
    if (currentImage && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentImage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Deen's Daily Hub! I am interested in ordering:\n\n🛍️ *${product.name}*\n💰 Price: $${product.price.toLocaleString()}\n📦 Category: ${product.category}\n🖼️ Image: ${currentImage}\n\nPlease confirm availability and dispatch!`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-sky-500 to-emerald-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-lg"
          title="Close (Esc)"
        >
          ✕
        </button>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] items-center">
          {/* LEFT: FULL IMAGE SHOWCASE */}
          <div className="flex flex-col items-center">
            <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
              {/* Subtle ambient blurred glow behind */}
              {currentImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-125 pointer-events-none"
                  style={{ backgroundImage: `url(${currentImage})` }}
                />
              )}

              {/* Uncropped Full Image */}
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="relative z-10 max-h-full max-w-full object-contain p-3 drop-shadow-2xl transition duration-300"
                />
              ) : (
                <div className="text-center text-slate-500 p-8">
                  <span className="text-4xl block mb-2">📦</span>
                  <p className="text-xs">No image provided</p>
                </div>
              )}

              {/* Prev / Next Arrows */}
              {imageList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i - 1 + imageList.length) % imageList.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 border border-white/15 text-white hover:bg-slate-800 transition text-lg shadow-lg"
                    title="Previous photo"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i + 1) % imageList.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 border border-white/15 text-white hover:bg-slate-800 transition text-lg shadow-lg"
                    title="Next photo"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              {imageList.length > 1 && (
                <span className="absolute bottom-3 right-3 z-20 rounded-full bg-slate-950/80 border border-white/10 px-3 py-1 text-[11px] font-mono font-semibold text-slate-300 backdrop-blur-md">
                  {currentIndex + 1} / {imageList.length}
                </span>
              )}
            </div>

            {/* Thumbnail Navigation Strip */}
            {imageList.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full py-1">
                {imageList.map((imgUrl, idx) => (
                  <button
                    key={imgUrl + idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-14 w-14 rounded-xl overflow-hidden border-2 transition flex-shrink-0 bg-slate-950 ${
                      idx === currentIndex ? 'border-brand-500 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-contain p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Link Actions */}
            {currentImage && (
              <div className="flex items-center gap-3 mt-3 text-xs">
                <a
                  href={currentImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold transition"
                >
                  <span>🔗 Open Full Res Image</span>
                  <span>↗</span>
                </a>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  {isCopied ? '✓ Link Copied!' : 'Copy Image Link'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: CARD DETAILS & ACTION BUTTONS */}
          <div className="flex flex-col space-y-4 text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-brand-500/15 border border-brand-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-400">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    {product.badge}
                  </span>
                )}
                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-semibold text-amber-300 ml-auto">
                  ★ {product.rating.toFixed(1)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {product.name}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Price
              </span>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Product Details
              </span>
              <p className="text-sm leading-relaxed text-slate-300 max-h-40 overflow-y-auto pr-1 whitespace-pre-line">
                {product.description || 'Quality product available for delivery straight to your doorstep.'}
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <span>🛡️</span> Verified Quality
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span>⚡</span> Express Dispatch
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="flex gap-2">
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(product.id);
                      onClose();
                    }}
                    className="flex-1 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-3 text-xs font-bold text-white transition flex items-center justify-center gap-2"
                  >
                    <span>🛒</span>
                    <span>Add to Cart</span>
                  </button>
                )}

                {onBuyNow && (
                  <button
                    type="button"
                    onClick={() => {
                      onBuyNow(product);
                      onClose();
                    }}
                    className="flex-1 rounded-2xl bg-brand-600 hover:bg-brand-500 px-4 py-3 text-xs font-bold text-white transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>Buy Now</span>
                  </button>
                )}
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>Inquire on WhatsApp (+1 438-540-3074)</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
