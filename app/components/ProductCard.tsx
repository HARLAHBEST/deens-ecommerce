"use client";

import { useState } from 'react';
import type { Product } from '@/data/products';

type ProductCardProps = {
  product: Product;
  onAddToCart: (id: number) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-brand-500/10">
      <div className="relative h-64 overflow-hidden bg-slate-950 flex items-center justify-center">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-950 w-full h-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 border border-brand-500/20 text-brand-400 font-bold text-xl mb-2">
              {product.name ? product.name.charAt(0).toUpperCase() : '📦'}
            </div>
            <span className="text-xs font-semibold text-slate-400">Cloudinary Image</span>
          </div>
        )}

        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-brand-600/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-600/30 border border-white/20">
            {product.badge}
          </span>
        ) : null}

        <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-300 border border-white/10">
          ★ {product.rating.toFixed(1)}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <span className="inline-block rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-400 mb-2">
            {product.category}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{product.name}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-400 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Price</span>
            <p className="text-xl font-extrabold text-white">${product.price.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            className="rounded-2xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition shadow-lg shadow-brand-600/30 flex items-center gap-1.5"
          >
            <span>🛒 Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
