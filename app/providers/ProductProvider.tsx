"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as initialProducts, type Product } from '@/data/products';

type ProductProviderValue = {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
};

const ProductContext = createContext<ProductProviderValue | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts(initialProducts);
      }
    } catch (err) {
      console.error('Failed to load products from MongoDB API:', err);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product from MongoDB:', err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, categories, addProduct, updateProduct, deleteProduct }}>
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
