"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { ProductCard } from './components/ProductCard';
import { RegisterModal } from './components/RegisterModal';
import { BuyNowModal } from './components/BuyNowModal';
import { ProductImageModal } from './components/ProductImageModal';
import { Footer } from './components/Footer';
import { useProduct } from './providers/ProductProvider';
import { useCart } from './providers/CartProvider';
import { useAuth } from './providers/AuthProvider';
import type { Product } from '@/data/products';

const MESSENGER_LINK = process.env.NEXT_PUBLIC_MESSENGER_LINK || "https://m.me/nurudeen.alabi.752";
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '14385403074').replace(/\D/g, '');
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Deen%27s%20Daily%20Hub%2C%20I%20have%20an%20inquiry%20about%20your%20products`;

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

  // Buy Now Modal State
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);

  // Full Image Modal State
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  const handleOpenImageModal = (product: Product, index: number = 0) => {
    setImageModalProduct(product);
    setImageModalIndex(index);
  };

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleAddToCart = (id: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    if (!user) {
      setPendingProduct(product);
      setRegisterModalOpen(true);
      return;
    }

    addToCart(product);
    setCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    setBuyNowProduct(product);
    setBuyNowModalOpen(true);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Simple Utility Bar */}
      <div className="border-b border-white/5 bg-slate-900/50 px-4 py-2 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="font-medium text-slate-300">Welcome to Deen's Daily Hub</p>
          <div className="flex items-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition flex items-center gap-1.5"
            >
              <span>💬 WhatsApp Chat</span>
            </a>
            <span className="text-slate-700">•</span>
            <a
              href={MESSENGER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 font-semibold transition flex items-center gap-1.5"
            >
              <span>⚡ Messenger Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-6">
        {/* Modern Polished Header — (Admin link hidden from public customers) */}
        <header className="sticky top-3 z-40 flex flex-col gap-3.5 rounded-2xl border border-white/10 bg-slate-900/90 p-3.5 sm:px-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-black text-lg shadow-md shadow-brand-600/30 group-hover:scale-105 transition">
              D
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition">
                Deen's Daily Hub
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Quality Everyday Essentials</p>
            </div>
          </Link>

          {/* Clean Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products or categories..."
              className="w-full rounded-full border border-white/10 bg-slate-950/90 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition shadow-inner"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
              🔍
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* User Account & Cart */}
          <div className="flex items-center justify-end gap-2.5">
            {user ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-200">
                <span className="font-semibold">👋 {user.name.split(' ')[0]}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-slate-400 hover:text-white ml-1 text-xs"
                  title="Logout"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-xs font-bold text-white hover:from-brand-500 hover:to-brand-600 transition shadow-lg shadow-brand-600/30"
            >
              <span>🛒 Cart</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-black">
                {totalItems}
              </span>
            </button>
          </div>
        </header>

        {/* Clean, Elegant Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-xl backdrop-blur-md">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-block rounded-full bg-brand-500/10 border border-brand-500/25 px-3 py-1 text-[11px] font-semibold text-brand-300">
              Curated Catalog
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Simple Shopping, <br />
              <span className="bg-gradient-to-r from-brand-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                Quality Everyday Finds.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Explore our hand-picked collection of essentials. Order seamlessly with fast dispatch and direct customer support on WhatsApp & Messenger.
            </p>
          </div>
        </section>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => {
              const count = categoryCounts[category] ?? 0;
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                      : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(selectedCategory !== 'All' || searchTerm) && (
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
              className="text-xs text-slate-400 hover:text-white transition whitespace-nowrap"
            >
              Reset ↺
            </button>
          )}
        </div>

        {/* Products Grid */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center text-slate-400 space-y-2">
              <p className="text-base font-semibold text-white">No products found</p>
              <p className="text-xs text-slate-500">Try selecting another category or clearing your search.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                className="mt-2 inline-block rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-500 transition"
              >
                Clear Filter
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product.id)}
                  onBuyNow={handleBuyNow}
                  onViewImage={handleOpenImageModal}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Comprehensive Rich Footer */}
      <Footer
        onCategoryClick={(cat) => {
          setSelectedCategory(cat);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
      />

      {/* Product Full Image & Details Card Modal */}
      <ProductImageModal
        isOpen={Boolean(imageModalProduct)}
        product={imageModalProduct}
        initialIndex={imageModalIndex}
        onClose={() => setImageModalProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Quick Registration Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        pendingProduct={pendingProduct}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* Buy Now Modal */}
      <BuyNowModal
        isOpen={buyNowModalOpen}
        product={buyNowProduct}
        onClose={() => { setBuyNowModalOpen(false); setBuyNowProduct(null); }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateQuantity}
      />
    </div>
  );
}
