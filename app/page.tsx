"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { ProductCard } from './components/ProductCard';
import { RegisterModal } from './components/RegisterModal';
import { useProduct } from './providers/ProductProvider';
import { useCart } from './providers/CartProvider';
import { useAuth } from './providers/AuthProvider';
import type { Product } from '@/data/products';

export default function HomePage() {
  const { products, categories } = useProduct();
  const { items: cartItems, totalItems, addToCart, updateQuantity, removeItem } = useCart();
  const { user, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => selectedCategory === 'All' || product.category === selectedCategory)
      .filter((product) =>
        [product.name, product.category, product.description, product.badge ?? '']
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
  }, [products, selectedCategory, searchTerm]);

  const handleAddToCart = (id: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    if (!user) {
      // Prompt customer to register when adding to cart
      setPendingProduct(product);
      setRegisterModalOpen(true);
      return;
    }

    addToCart(product);
    setCartOpen(true);
  };

  const handleRegisterSuccess = () => {
    if (pendingProduct) {
      addToCart(pendingProduct);
      setPendingProduct(null);
    }
    setRegisterModalOpen(false);
    setCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,29,72,0.18),_transparent_40%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Sleek Top Navigation Bar */}
        <header className="sticky top-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/90 p-4 sm:px-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white font-black text-xl shadow-lg shadow-brand-600/30">
              D
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Deen's Daily Hub</h1>
              <p className="text-[11px] text-brand-400 font-semibold uppercase tracking-wider">Premium E-Commerce</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, category..."
              className="w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 placeholder-slate-400 outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                <span className="font-semibold">👋 {user.name.split(' ')[0]}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-slate-400 hover:text-white transition ml-1"
                  title="Logout"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingProduct(null);
                  setRegisterModalOpen(true);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15 transition"
              >
                Register / Sign in
              </button>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 transition shadow-lg shadow-brand-600/30"
            >
              <span>🛒 Cart</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">{totalItems}</span>
            </button>
          </div>
        </header>

        {/* Clean Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Straightforward Products Section */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center text-slate-400">
              No products found matching your search. Try adjusting filters or search query.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Registration Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        pendingProduct={pendingProduct}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* Cart Drawer */}
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
