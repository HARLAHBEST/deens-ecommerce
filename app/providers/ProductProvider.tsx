"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as initialProducts, type Product } from '@/data/products';

type ProductProviderValue = {
  products: Product[];
  archivedProducts: Product[];
  allProducts: Product[];
  categories: string[];
  customCategories: string[];
  addCategory: (name: string) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (name: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  restoreProduct: (id: number) => Promise<void>;
  deleteProductPermanent: (id: number) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductProviderValue | undefined>(undefined);
const STORED_CATEGORIES_KEY = 'deensdaily-custom-categories';

export function ProductProvider({ children }: { children: ReactNode }) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCustomCategories((prev) => {
          const merged = Array.from(new Set([...prev, ...data.categories]));
          try {
            localStorage.setItem(STORED_CATEGORIES_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch {}
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setAllProducts(data.products);
      }
    } catch {}
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORED_CATEGORIES_KEY);
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch {}

    refreshProducts();
    refreshCategories();
  }, []);

  // Active products visible in storefront and active catalog
  const products = useMemo(
    () => allProducts.filter((p) => !p.isArchived),
    [allProducts]
  );

  // Deleted/Archived products saved in trash bin for easy re-upload/restoration
  const archivedProducts = useMemo(
    () => allProducts.filter((p) => p.isArchived === true),
    [allProducts]
  );

  const categories = useMemo(() => {
    const productCategories = products.map((product) => product.category);
    const combined = Array.from(
      new Set([...customCategories, ...productCategories].filter((c) => Boolean(c && c.trim())))
    );
    return ['All', ...combined.sort((a, b) => a.localeCompare(b))];
  }, [products, customCategories]);

  const addCategory = async (name: string): Promise<{ success: boolean; error?: string }> => {
    const clean = name.trim();
    if (!clean) return { success: false, error: 'Category name cannot be empty.' };

    const exists = categories.some((c) => c.toLowerCase() === clean.toLowerCase());
    if (exists) return { success: false, error: 'This category already exists.' };

    // Optimistically update
    setCustomCategories((prev) => {
      const next = Array.from(new Set([...prev, clean]));
      try {
        localStorage.setItem(STORED_CATEGORIES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Failed to save category.' };
      }
      return { success: true };
    } catch {
      // Still saved locally
      return { success: true };
    }
  };

  const deleteCategory = async (name: string) => {
    const clean = name.trim();
    setCustomCategories((prev) => {
      const next = prev.filter((c) => c.toLowerCase() !== clean.toLowerCase());
      try {
        localStorage.setItem(STORED_CATEGORIES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await fetch(`/api/categories?name=${encodeURIComponent(clean)}`, {
        method: 'DELETE',
      });
    } catch {}
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const maxId = allProducts.reduce((max, p) => Math.max(max, p.id || 0), 0);
    const nextFallbackId = maxId + 1;
    const fallbackImages = (product.images && product.images.length > 0)
      ? product.images
      : [product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];

    const optimisticProduct: Product = {
      ...product,
      id: nextFallbackId,
      image: fallbackImages[0],
      images: fallbackImages,
      isArchived: false,
    };

    // Optimistically add to UI state immediately
    setAllProducts((prev) => [optimisticProduct, ...prev]);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...optimisticProduct }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setAllProducts((prev) => [
          data.product,
          ...prev.filter((p) => p.id !== optimisticProduct.id && p.id !== data.product.id),
        ]);
      }
    } catch (err) {
      console.error('Failed to sync product to MongoDB:', err);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    try {
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setAllProducts((prev) =>
          prev.map((product) => (product.id === data.product.id ? data.product : product))
        );
      }
    } catch (err) {
      console.error('Failed to update product in MongoDB:', err);
    }
  };

  // Soft-delete: Moves product to Archived / Trash bin so it is saved safely
  const deleteProduct = async (id: number) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p))
    );
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to archive product in MongoDB:', err);
    }
  };

  // Restore: Brings an archived item back to the live storefront
  const restoreProduct = async (id: number) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: false } : p))
    );
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false }),
      });
    } catch (err) {
      console.error('Failed to restore product in MongoDB:', err);
    }
  };

  // Permanent Delete: Erases product completely from MongoDB
  const deleteProductPermanent = async (id: number) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}?permanent=true`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to permanently delete product:', err);
    }
  };

  const clearAllProducts = async () => {
    setAllProducts([]);
    try {
      await fetch('/api/products', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear products from MongoDB:', err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        archivedProducts,
        allProducts,
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
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within ProductProvider');
  }
  return context;
}
