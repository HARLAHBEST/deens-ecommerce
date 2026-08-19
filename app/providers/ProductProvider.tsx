"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as initialProducts, type Product } from '@/data/products';

type ProductProviderValue = {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductProviderValue | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  // Initialise instantly with static data so the page renders immediately on load
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch {}
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [...prev, data.product]);
      }
    } catch (err) {
      console.error('Failed to add product to MongoDB:', err);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    // Optimistic UI update — immediately reflect the change
    setProducts((prev) =>
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
        setProducts((prev) =>
          prev.map((product) => (product.id === data.product.id ? data.product : product))
        );
      }
    } catch (err) {
      console.error('Failed to update product in MongoDB:', err);
    }
  };

  const deleteProduct = async (id: number) => {
    // Optimistic UI update — remove immediately
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete product from MongoDB:', err);
    }
  };

  const clearAllProducts = async () => {
    setProducts([]);
    try {
      await fetch('/api/products', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear products from MongoDB:', err);
    }
  };

  return (
    <ProductContext.Provider
      value={{ products, categories, addProduct, updateProduct, deleteProduct, clearAllProducts, refreshProducts }}
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
