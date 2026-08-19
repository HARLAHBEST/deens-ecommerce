"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useProduct } from '../providers/ProductProvider';
import { useAuth } from '../providers/AuthProvider';
import { ProductForm } from '../components/ProductForm';
import type { Product } from '@/data/products';

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, clearAllProducts, refreshProducts } = useProduct();
  const { users, refreshUsers, deleteUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshUsers();
    refreshProducts();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshUsers(), refreshProducts()]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const [activeTab, setActiveTab] = useState<'customers' | 'products'>('customers');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  const handleClearAllProducts = async () => {
    if (confirm('Are you sure you want to delete ALL products and images from the database? This will clear the catalog for deployment.')) {
      await clearAllProducts();
      setSelectedProduct(undefined);
    }
  };

  const visibleProducts = useMemo(() => {
    return products.filter((product) =>
      [product.name, product.category, product.description, product.badge || '']
        .join(' ')
        .toLowerCase()
        .includes(productFilter.toLowerCase())
    );
  }, [products, productFilter]);

  const visibleCustomers = useMemo(() => {
    return users.filter((u) => {
      const itemsString = (u.registeredItems || []).map((i) => i.productName).join(' ');
      return [u.name, u.email, u.phone, itemsString]
        .join(' ')
        .toLowerCase()
        .includes(customerFilter.toLowerCase());
    });
  }, [users, customerFilter]);

  const handleSaveProduct = (product: Omit<Product, 'id'>, id?: number) => {
    if (id) {
      updateProduct({ ...product, id });
    } else {
      addProduct(product);
    }
    setSelectedProduct(undefined);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,29,72,0.18),_transparent_35%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Header */}
        <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-brand-400">
                  Admin Dashboard
                </span>
                <span className="text-xs text-slate-400">Deen's Daily Hub</span>
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Store Operations & Customer Database
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-300 transition hover:bg-brand-500/20 disabled:opacity-50"
              >
                <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/15"
              >
                ← Back to Shop
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Catalog Products</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Registered Customers</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-400">{users.length}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Items Registered</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                {users.reduce((acc, u) => acc + (u.registeredItems?.length || 0), 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">WhatsApp Checkout</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-400">Active</p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'customers'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              👥 Customer Registrations ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              📦 Products Catalog ({products.length})
            </button>
          </div>

          {activeTab === 'customers' && (
            <input
              type="text"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Search by customer email, name, phone..."
              className="w-full sm:w-72 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500 transition"
            />
          )}

          {activeTab === 'products' && (
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Search products by name, category..."
              className="w-full sm:w-72 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500 transition"
            />
          )}
        </div>

        {/* TAB 1: REGISTERED CUSTOMERS & ITEMS BOUGHT AT REGISTRATION TABLE */}
        {activeTab === 'customers' && (
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Registered Customer Database</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Every customer email, exact registration date & time, and the item they added/bought at registration.
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 text-xs text-brand-300 font-semibold">
                  Live Sync Active
                </span>
              </div>

              {visibleCustomers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-12 text-center text-slate-400">
                  No customer registration records match your search query.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-white/10 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th scope="col" className="px-6 py-4"># ID</th>
                        <th scope="col" className="px-6 py-4">Customer Email & Name</th>
                        <th scope="col" className="px-6 py-4">Phone Number</th>
                        <th scope="col" className="px-6 py-4">Registration Time</th>
                        <th scope="col" className="px-6 py-4">Items Added / Bought at Registration</th>
                        <th scope="col" className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {visibleCustomers.map((cust) => {
                        const hasItems = cust.registeredItems && cust.registeredItems.length > 0;
                        return (
                          <tr key={cust.id} className="hover:bg-white/[0.02] transition">
                            <td className="px-6 py-4 font-mono text-xs text-brand-400 font-bold">
                              #{cust.id.toString().padStart(3, '0')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-white">{cust.name}</div>
                              <div className="text-xs text-brand-300 font-mono mt-0.5">{cust.email}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-300">
                              {cust.phone || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-300">
                              <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1 font-mono text-slate-300 border border-white/5">
                                {formatDate(cust.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {hasItems ? (
                                <div className="space-y-2">
                                  {cust.registeredItems!.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 font-medium"
                                    >
                                      <span>🛍️ {item.productName}</span>
                                      <span className="rounded-md bg-emerald-950 px-2 py-0.5 font-bold font-mono text-emerald-400">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 italic">No specific initial item logged</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete customer "${cust.name}" (${cust.email})?`)) {
                                    deleteUser(cust.id);
                                  }
                                }}
                                className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <h2 className="text-xl font-bold text-white">Store Items ({visibleProducts.length})</h2>
                <div className="flex items-center gap-2">
                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllProducts}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                    >
                      🗑️ Delete All Images & Items
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(undefined)}
                    className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
                  >
                    + Add New Product
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 hover:border-brand-500/30 transition shadow-soft"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-brand-400 font-bold">#{product.id}</span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-white mt-1">{product.name}</h3>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">${product.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="rounded-xl bg-brand-600/80 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
                      >
                        Edit Item
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Form Side Panel */}
            <div className="sticky top-6">
              <ProductForm
                initialProduct={selectedProduct}
                onSave={handleSaveProduct}
                onCancel={() => setSelectedProduct(undefined)}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
