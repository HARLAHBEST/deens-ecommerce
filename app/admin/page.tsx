"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useProduct } from '../providers/ProductProvider';
import { useAuth } from '../providers/AuthProvider';
import { ProductForm } from '../components/ProductForm';
import type { Product } from '@/data/products';

export default function AdminPage() {
  const {
    products,
    archivedProducts,
    categories,
    customCategories,
    addCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    deleteProductPermanent,
    clearAllProducts,
    refreshProducts,
  } = useProduct();
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

  const [activeTab, setActiveTab] = useState<'customers' | 'products' | 'categories' | 'archived'>('customers');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [archivedFilter, setArchivedFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Category creation state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryMsg, setCategoryMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    setCategoryMsg(null);
    const res = await addCategory(newCategoryName.trim());
    if (res.success) {
      setCategoryMsg({ text: `Category "${newCategoryName.trim()}" created successfully!` });
      setNewCategoryName('');
    } else {
      setCategoryMsg({ text: res.error || 'Failed to create category.', isError: true });
    }
    setIsAddingCategory(false);
    setTimeout(() => setCategoryMsg(null), 4000);
  };

  const handleClearAllProducts = async () => {
    if (confirm('Are you sure you want to delete ALL active products from the database? This will clear the catalog for deployment.')) {
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

  const visibleArchived = useMemo(() => {
    return archivedProducts.filter((product) =>
      [product.name, product.category, product.description, product.badge || '']
        .join(' ')
        .toLowerCase()
        .includes(archivedFilter.toLowerCase())
    );
  }, [archivedProducts, archivedFilter]);

  const nonAdminCustomers = useMemo(() => {
    return users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return !name.includes('admin') && !email.includes('admin') && !phone.includes('admin');
    });
  }, [users]);

  const visibleCustomers = useMemo(() => {
    return nonAdminCustomers.filter((u) => {
      const itemsString = (u.registeredItems || []).map((i) => i.productName).join(' ');
      return [u.name, u.email, u.phone, itemsString]
        .join(' ')
        .toLowerCase()
        .includes(customerFilter.toLowerCase());
    });
  }, [nonAdminCustomers, customerFilter]);

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
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Banner */}
        <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-black text-2xl shadow-lg shadow-brand-600/30">
                ⚙️
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-brand-400 font-bold">Admin Portal</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Deen's Daily Hub Management</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : '🔄 Refresh Data'}
              </button>
              <Link
                href="/"
                className="rounded-full bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-600/30"
              >
                ← View Store
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Customer Inquiries</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-400">{nonAdminCustomers.length}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Live Catalog Items</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Store Categories</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-400">{categories.filter(c => c !== 'All').length}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Saved / Deleted Items</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold text-amber-400">{archivedProducts.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  In Trash
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Hosting & Storage</p>
              <p className="mt-1 text-2xl font-extrabold text-sky-400">100% Free</p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'customers'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              👥 Customer Registrations ({nonAdminCustomers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              📦 Live Products ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              📂 Categories ({categories.filter(c => c !== 'All').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'archived'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🗑️ Saved / Deleted Items ({archivedProducts.length})
            </button>
          </div>

          {activeTab === 'customers' && (
            <input
              type="text"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Search customers..."
              className="w-full sm:w-64 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand-500 transition"
            />
          )}

          {activeTab === 'categories' && (
            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Search categories..."
              className="w-full sm:w-64 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 transition"
            />
          )}

          {activeTab === 'products' && (
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Search live products..."
              className="w-full sm:w-64 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand-500 transition"
            />
          )}

          {activeTab === 'archived' && (
            <input
              type="text"
              value={archivedFilter}
              onChange={(e) => setArchivedFilter(e.target.value)}
              placeholder="Search saved deleted items..."
              className="w-full sm:w-64 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 text-xs sm:text-sm text-white outline-none focus:border-amber-500 transition"
            />
          )}
        </div>

        {/* TAB 1: CUSTOMERS TABLE */}
        {activeTab === 'customers' && (
          <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Customer Inquiries</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customer contact preferences and product inquiries captured during browsing & checkout.
                </p>
              </div>
              <span className="text-xs text-slate-400">Total: {visibleCustomers.length} records</span>
            </div>

            {visibleCustomers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                No customer inquiries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-white/10 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Contact Preference</th>
                      <th className="px-6 py-4">Date Registered</th>
                      <th className="px-6 py-4">Product Inquired</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {visibleCustomers.map((cust) => {
                      const hasItems = cust.registeredItems && cust.registeredItems.length > 0;
                      return (
                        <tr key={cust.id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 font-bold text-white shadow-md">
                                {cust.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{cust.name}</p>
                                <p className="text-xs text-slate-400">ID #{cust.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {cust.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            {cust.contactMethod === 'whatsapp' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                💬 WhatsApp
                              </span>
                            ) : cust.contactMethod === 'messenger' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                                ⚡ Messenger
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                📱 Direct Call / SMS
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-300">
                            <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1 font-mono text-slate-300 border border-white/5">
                              {formatDate(cust.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {hasItems ? (
                              <div className="space-y-1.5">
                                {cust.registeredItems!.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 font-medium"
                                  >
                                    <span>🛍️</span>
                                    <span>
                                      {item.productName} ({item.quantity}x)
                                    </span>
                                    <span className="font-bold text-white">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">No specific item attached</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete customer "${cust.name}"?`)) {
                                  deleteUser(cust.id);
                                }
                              }}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
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
          </section>
        )}

        {/* TAB 2: LIVE PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Catalog List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Active Product Catalog ({products.length})</h2>
                  <p className="text-xs text-slate-400">Live inventory visible to customers on the storefront.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllProducts}
                    className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                  >
                    Clear Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(undefined)}
                    className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-600/30"
                  >
                    + Add New Product
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 hover:border-brand-500/30 transition shadow-soft"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={(product.images && product.images.length > 0) ? product.images[0] : product.image}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-brand-400 font-bold">#{product.id}</span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400">
                            {product.category}
                          </span>
                          {product.images && product.images.length > 1 && (
                            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                              📷 {product.images.length} photos
                            </span>
                          )}
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
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Move "${product.name}" to Trash / Saved items? It will be saved safely and can be restored anytime.`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                        title="Move to Trash Bin (Soft Delete)"
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

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📂</span>
                  <h2 className="text-xl font-bold text-white">Store Categories Management</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Create new product categories. Any category you add will automatically appear in product dropdowns and storefront filters.
                </p>
              </div>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 text-xs font-bold text-indigo-300">
                {categories.filter((c) => c !== 'All').length} Active Categories
              </span>
            </div>

            {/* Quick Add Category Input */}
            <form onSubmit={handleAddCategory} className="rounded-2xl border border-indigo-500/20 bg-slate-950/70 p-4 sm:p-6 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300">
                + Create New Category
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Smart Electronics, Kitchenware, Luxury Watches, Shoes..."
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={isAddingCategory || !newCategoryName.trim()}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 whitespace-nowrap"
                >
                  {isAddingCategory ? 'Adding...' : '+ Add Category'}
                </button>
              </div>
              {categoryMsg && (
                <p className={`text-xs font-medium ${categoryMsg.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {categoryMsg.text}
                </p>
              )}
            </form>

            {/* Categories List Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories
                .filter((c) => c !== 'All')
                .filter((c) => c.toLowerCase().includes(categoryFilter.toLowerCase()))
                .map((category) => {
                  const itemCount = products.filter((p) => p.category === category).length;
                  const isCustom = customCategories.includes(category);
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-indigo-500/40 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-sm border border-indigo-500/20">
                          📁
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{category}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} in catalog
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProductFilter(category);
                            setActiveTab('products');
                          }}
                          className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                          title="View products in this category"
                        >
                          View
                        </button>
                        {isCustom && itemCount === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete custom category "${category}"?`)) {
                                deleteCategory(category);
                              }
                            }}
                            className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20 transition"
                            title="Delete category"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* TAB 4: SAVED / DELETED ITEMS (TRASH BIN & 1-CLICK RESTORE) */}
        {activeTab === 'archived' && (
          <section className="rounded-[2.5rem] border border-amber-500/20 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗑️</span>
                  <h2 className="text-xl font-bold text-white">Saved / Deleted Items (Trash Bin)</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Deleted products are preserved here with all descriptions, prices, and uploaded photos. Click <strong className="text-amber-300">Restore</strong> to re-upload and publish them back to the live storefront instantly.
                </p>
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                {archivedProducts.length} items saved
              </span>
            </div>

            {visibleArchived.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center space-y-3">
                <div className="text-4xl">📦</div>
                <h3 className="text-base font-bold text-white">Trash bin is empty</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When you delete an item from the live catalog, it will be safely preserved here in case the company wants to re-upload or re-publish it in the future.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {visibleArchived.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-slate-950/70 p-4 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={(product.images && product.images.length > 0) ? product.images[0] : product.image}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover border border-white/10 opacity-80 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400 font-bold">#{product.id}</span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400">
                            {product.category}
                          </span>
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            Archived
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-white mt-1">{product.name}</h3>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">${product.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Restore / Re-upload Button */}
                      <button
                        type="button"
                        onClick={() => restoreProduct(product.id)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <span>♻️ Restore to Catalog</span>
                      </button>

                      {/* Permanent Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Permanently erase "${product.name}" from database? This action cannot be undone.`)) {
                            deleteProductPermanent(product.id);
                          }
                        }}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                        title="Permanent Delete"
                      >
                        ✕ Erase Permanently
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
