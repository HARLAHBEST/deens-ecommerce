"use client";

import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import type { Product } from '@/data/products';

type ProductFormProps = {
  initialProduct?: Product;
  onSave: (product: Omit<Product, 'id'>, id?: number) => void;
  onCancel: () => void;
};

const emptyProduct = {
  name: '',
  price: 0,
  category: '',
  rating: 4.5,
  image: '',
  description: '',
  badge: '',
};

export function ProductForm({ initialProduct, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        name: initialProduct.name,
        price: initialProduct.price,
        category: initialProduct.category,
        rating: initialProduct.rating,
        image: initialProduct.image,
        description: initialProduct.description,
        badge: initialProduct.badge ?? '',
      });
      setImagePreview(initialProduct.image);
    } else {
      setForm(emptyProduct);
      setImagePreview('');
    }
  }, [initialProduct]);

  const handleChange = (field: keyof Omit<Product, 'id'>, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'image') {
      setImagePreview(String(value));
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        setImagePreview(data.url);
      } else {
        alert(data.error || 'Failed to upload image to Cloudinary');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Error uploading image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(form, initialProduct?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-brand-500">Catalog Editor</p>
          <h2 className="text-2xl font-bold text-white">{initialProduct ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <span className="rounded-full bg-brand-600/20 border border-brand-500/30 px-3.5 py-1.5 text-xs font-semibold text-brand-300">
          {initialProduct ? 'Updating #' + initialProduct.id : 'New Entry'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Product Name *
          <input
            name="name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g. Smart Noise Canceling Headphones"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
            required
          />
        </label>
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Category *
          <input
            name="category"
            value={form.category}
            onChange={(event) => handleChange('category', event.target.value)}
            placeholder="Electronics, Travel, Lifestyle..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Price ($) *
          <input
            name="price"
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(event) => handleChange('price', Number(event.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-brand-500"
            required
          />
        </label>
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Rating (1 - 5)
          <input
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(event) => handleChange('rating', Number(event.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-brand-500"
          />
        </label>
      </div>

      {/* PRODUCT IMAGE UPLOAD SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Product Image *</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1 text-xs rounded-full transition ${
                uploadMode === 'file'
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3 py-1 text-xs rounded-full transition ${
                uploadMode === 'url'
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              🔗 Image URL
            </button>
          </div>
        </div>

        {uploadMode === 'file' ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-slate-950 p-4 text-center hover:border-brand-500/50 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
            >
              {isUploading ? '☁️ Uploading to Cloudinary...' : 'Select Image File From Device'}
            </button>
            <p className="mt-2 text-[11px] text-slate-400">Supports JPG, PNG, WEBP, GIF (Saved automatically)</p>
          </div>
        ) : (
          <input
            name="image"
            value={form.image}
            onChange={(event) => handleChange('image', event.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
          />
        )}

        {/* Live Image Preview */}
        {imagePreview && (
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 p-2.5">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-14 w-14 rounded-xl object-cover border border-white/10"
            />
            <div className="text-xs">
              <span className="font-semibold text-emerald-400">✓ Image Ready</span>
              <p className="text-slate-400 text-[11px] truncate max-w-[200px]">
                {imagePreview.startsWith('data:') ? 'Local file uploaded' : imagePreview}
              </p>
            </div>
          </div>
        )}
      </div>

      <label className="space-y-1.5 text-xs font-semibold text-slate-300 block">
        Short Description *
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={(event) => handleChange('description', event.target.value)}
          placeholder="Brief features or details..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
          required
        />
      </label>

      <label className="space-y-1.5 text-xs font-semibold text-slate-300 block">
        Badge / Tag (Optional)
        <input
          name="badge"
          value={form.badge}
          onChange={(event) => handleChange('badge', event.target.value)}
          placeholder="e.g. Best Seller, New, 20% OFF"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500"
        />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-slate-950 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-2xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition shadow-lg shadow-brand-600/30"
        >
          {initialProduct ? 'Save Changes' : 'Publish Product'}
        </button>
      </div>
    </form>
  );
}
