import Image from 'next/image';
import type { Product } from '@/data/products';

type ProductCardProps = {
  product: Product;
  onAddToCart: (id: number) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-soft transition hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl">
      <div className="relative h-72 overflow-hidden bg-slate-900">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-brand-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-soft">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <span className="rounded-full bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">{product.category}</span>
          <span className="flex items-center gap-1 text-amber-300">★ {product.rating.toFixed(1)}</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-100">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-semibold text-white">${product.price}</p>
          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
