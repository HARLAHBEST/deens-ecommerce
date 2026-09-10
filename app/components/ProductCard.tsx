"use client";

import { useState } from 'react';
import type { Product } from '@/data/products';

type ProductCardProps = {
  product: Product;
  onAddToCart: (id: number) => void;
  onBuyNow: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart, onBuyNow }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Build the image list — prefer the images[] array, fall back to single image
  const imageList: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const currentImage = imageList[activeIndex] || '';
  const hasMultiple = imageList.length > 1;

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % imageList.length);
  };
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + imageList.length) % imageList.length);
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-brand-500/10 flex flex-col">
      {/* Image Area */}
      <div className="relative h-64 overflow-hidden bg-slate-950 flex items-center justify-center flex-shrink-0">
        {currentImage && !imgError ? (
          <img
            key={currentImage}
            src={currentImage}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-950 w-full h-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 border border-brand-500/20 text-brand-400 font-bold text-xl mb-2">
              {product.name ? product.name.charAt(0).toUpperCase() : '📦'}
            </div>
            <span className="text-xs font-semibold text-slate-400">No Image</span>
          </div>
        )}

        {/* Carousel Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-sm text-white border border-white/10 opacity-0 group-hover:opacity-100 transition hover:bg-slate-800 text-sm"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-sm text-white border border-white/10 opacity-0 group-hover:opacity-100 transition hover:bg-slate-800 text-sm"
              aria-label="Next image"
            >
              ›
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imageList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge */}
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-brand-600/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-600/30 border border-white/20">
            {product.badge}
          </span>
        ) : null}

        <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-300 border border-white/10">
          ★ {product.rating.toFixed(1)}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 space-y-4 p-5">
        <div>
          <span className="inline-block rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-400 mb-2">
            {product.category}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{product.name}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-400 line-clamp-2">{product.description}</p>
        </div>

        <div className="mt-auto pt-3 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Price</span>
              <p className="text-xl font-extrabold text-white">${product.price.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className="rounded-2xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition shadow-lg shadow-brand-600/30 flex items-center gap-1.5"
            >
              <span>🛒 Add to Cart</span>
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={() => onBuyNow(product)}
            className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition flex items-center justify-center gap-2"
          >
            <span>⚡ Buy Now</span>
            <span className="text-emerald-500">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
