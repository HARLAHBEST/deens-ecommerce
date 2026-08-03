"use client";

import { useMemo, useState } from 'react';
import { products } from '@/data/products';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';

const categories = ['All', 'Audio', 'Wearables', 'Computers', 'Travel'];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory]);

  const addToCart = (id: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === id);
      if (existing) {
        return prev.map((item) => (item.product.id === id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      const product = products.find((item) => item.id === id);
      if (!product) return prev;
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,29,72,0.22),_transparent_32%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        <header className="flex flex-col gap-4 rounded-[2.5rem] border border-white/10 bg-slate-900/75 px-6 py-5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-500">DeensDaily Hub</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">A premium online shopping destination for modern essentials.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm">Free shipping over $150</span>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Cart ({totalItems})
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-brand-500">Featured collection</p>
            <h2 className="mb-6 text-4xl font-semibold sm:text-5xl">Luxury products designed for everyday performance.</h2>
            <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-300">
              Shop smartly curated electronics, accessories, and travel essentials with fast delivery and premium support.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#products"
                className="inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Shop products
              </a>
              <a
                href="#features"
                className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Explore benefits
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Why choose DeensDaily</h3>
              <span className="text-sm text-slate-400">Built for modern brands</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-brand-400">•</span> Secure checkout with trusted payment options.
              </li>
              <li className="flex gap-3">
                <span className="text-brand-400">•</span> Fast dispatch and premium customer support.
              </li>
              <li className="flex gap-3">
                <span className="text-brand-400">•</span> Hassle-free returns and curated loyalty rewards.
              </li>
            </ul>
          </div>
        </section>

        <section id="features" className="grid gap-4 sm:grid-cols-3">
          {['Fast Delivery', 'Trusted Quality', 'Easy Returns'].map((feature) => (
            <div key={feature} className="rounded-[2rem] border border-white/10 bg-slate-900/65 p-5">
              <h3 className="text-lg font-semibold text-white">{feature}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">A refined shopping journey built for convenience and confidence.</p>
            </div>
          ))}
        </section>

        <section id="products" className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-soft">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Featured products</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">Curated for style and performance</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-950/70 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      </div>

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateQuantity}
        onRemove={removeItem}
      />
    </main>
  );
}
