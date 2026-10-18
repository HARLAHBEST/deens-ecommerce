"use client";

import { useEffect, useState, useRef, useMemo, type FormEvent, type ChangeEvent } from 'react';
import type { Product } from '@/data/products';
import { useProduct } from '../providers/ProductProvider';

type ProductFormProps = {
  initialProduct?: Product;
  onSave: (product: Omit<Product, 'id'>, id?: number) => void;
  onCancel: () => void;
};

const PRESET_CATEGORIES = [
  'Audio',
  'Wearables',
  'Computers',
  'Travel',
  'Lifestyle',
  'Fashion',
  'Home & Living',
  'Food & Drinks',
];

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  category: '',
  rating: 4.5,
  image: '',
  images: [],
  description: '',
  badge: '',
};

const SAMPLE_IMAGES = [
  { label: 'Gadget', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { label: 'Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
];

export function ProductForm({ initialProduct, onSave, onCancel }: ProductFormProps) {
  const { categories, addCategory } = useProduct();
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [categoryMode, setCategoryMode] = useState<'preset' | 'custom'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableCategories = useMemo(() => {
    const combined = Array.from(
      new Set([...categories.filter((c) => c !== 'All'), ...PRESET_CATEGORIES])
    );
    return [...combined.sort(), 'Other'];
  }, [categories]);

  useEffect(() => {
    setFormError('');
    if (initialProduct) {
      const inPreset = availableCategories.includes(initialProduct.category) && initialProduct.category !== 'Other';
      setCategoryMode(inPreset ? 'preset' : 'custom');
      setForm({
        name: initialProduct.name,
        price: initialProduct.price,
        category: initialProduct.category,
        rating: initialProduct.rating,
        image: initialProduct.image,
        images: initialProduct.images && initialProduct.images.length > 0
          ? initialProduct.images
          : initialProduct.image ? [initialProduct.image] : [],
        description: initialProduct.description,
        badge: initialProduct.badge ?? '',
      });
    } else {
      setForm(emptyProduct);
      setCategoryMode('preset');
    }
  }, [initialProduct, availableCategories]);

  const handleChange = (field: keyof Omit<Product, 'id'>, value: string | number | string[]) => {
    setFormError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (cat: string) => {
    setFormError('');
    if (cat === 'Other') {
      setCategoryMode('custom');
      handleChange('category', '');
    } else {
      setCategoryMode('preset');
      handleChange('category', cat);
    }
  };

  // Upload image file via Cloudinary
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    setFormError('');
    const newUrls: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          setFormError(data.error || `Failed to upload: ${file.name}`);
        }
      } catch {
        setFormError(`Error uploading ${file.name}. You can also use "Add via Image URL".`);
      }
    }

    if (newUrls.length > 0) {
      setForm((prev) => {
        const existing = prev.images || [];
        const combined = [...existing, ...newUrls].slice(0, 8);
        return {
          ...prev,
          images: combined,
          image: combined[0] || prev.image,
        };
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
  };

  // Add an image directly via URL
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      setFormError('Please enter a valid web link starting with https://');
      return;
    }
    setFormError('');
    setForm((prev) => {
      const existing = prev.images || [];
      const combined = [...existing, url].slice(0, 8);
      return {
        ...prev,
        images: combined,
        image: combined[0] || url,
      };
    });
    setImageUrlInput('');
    setShowUrlInput(false);
  };

  const handleAddSampleImage = (url: string) => {
    setFormError('');
    setForm((prev) => {
      const existing = prev.images || [];
      const combined = [...existing, url].slice(0, 8);
      return {
        ...prev,
        images: combined,
        image: combined[0] || url,
      };
    });
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const newImages = prev.images!.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || '',
      };
    });
  };

  const moveImage = (from: number, to: number) => {
    setForm((prev) => {
      const arr = [...(prev.images || [])];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...prev, images: arr, image: arr[0] || '' };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Product Name is required.');
      return;
    }

    const cleanCategory = form.category?.trim();
    if (!cleanCategory) {
      setFormError('Category is required. Please select or type a category.');
      return;
    }

    if (form.price === undefined || form.price === null || isNaN(Number(form.price)) || form.price < 0) {
      setFormError('Please enter a valid price (e.g. 19.99).');
      return;
    }

    const currentImages = form.images && form.images.length > 0
      ? form.images
      : form.image ? [form.image] : [];

    if (currentImages.length === 0) {
      setFormError('Please add at least 1 product image (Upload file or paste image URL).');
      return;
    }

    try {
      setIsSaving(true);
      if (cleanCategory) {
        addCategory(cleanCategory);
      }
      await onSave(
        {
          ...form,
          name: form.name.trim(),
          category: cleanCategory,
          price: Number(form.price),
          images: currentImages,
          image: currentImages[0],
          description: form.description?.trim() || form.name.trim(),
        },
        initialProduct?.id
      );
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const images = form.images || [];
  const isPreset = (val: string) => availableCategories.filter(c => c !== 'Other').includes(val);

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

      {formError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>{formError}</span>
        </div>
      )}

      {/* Name & Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Product Name *
          <input
            name="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Smart Noise Canceling Headphones"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 mt-1.5"
            required
          />
        </label>

        {/* Category Dropdown */}
        <div className="space-y-1.5 text-xs font-semibold text-slate-300">
          Category *
          <select
            value={isPreset(form.category) ? form.category : 'Other'}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-brand-500 mt-1.5 cursor-pointer"
            required={categoryMode === 'preset'}
          >
            <option value="" disabled>Select a category...</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Other' ? '+ Other (Type New Category)' : cat}
              </option>
            ))}
          </select>
          {categoryMode === 'custom' && (
            <input
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Type your new category name..."
              className="w-full rounded-2xl border border-brand-500/40 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 mt-2"
              required
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Price & Rating */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Price ($) *
          <input
            name="price"
            type="number"
            min={0}
            step={0.01}
            value={form.price === 0 ? '' : form.price}
            onChange={(e) => handleChange('price', e.target.value === '' ? 0 : Number(e.target.value))}
            placeholder="0.00"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-brand-500 mt-1.5"
            required
          />
        </label>
        <label className="space-y-1.5 text-xs font-semibold text-slate-300">
          Rating (1–5)
          <input
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => handleChange('rating', Number(e.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-brand-500 mt-1.5"
          />
        </label>
      </div>

      {/* Multi-Image Upload & URL Input */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-300">
            Product Images * <span className="text-slate-500 font-normal">({images.length}/8)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              🔗 {showUrlInput ? 'Hide URL' : 'Paste Image URL'}
            </button>
            {images.length < 8 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-full bg-brand-600/20 border border-brand-500/30 px-3.5 py-1 text-xs font-semibold text-brand-300 hover:bg-brand-600/30 transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="animate-pulse">☁️ Uploading...</span>
                  ) : (
                    <>📁 Upload File</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* URL Input Bar */}
        {showUrlInput && (
          <div className="flex gap-2 rounded-2xl border border-sky-500/30 bg-slate-950/90 p-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Paste direct image link: https://..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow"
            >
              Add
            </button>
          </div>
        )}

        {/* Image Thumbnails Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className={`relative group rounded-xl overflow-hidden border-2 transition ${
                  idx === 0 ? 'border-brand-500' : 'border-white/10'
                }`}
              >
                <img
                  src={url}
                  alt={`Product image ${idx + 1}`}
                  className="h-16 w-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-600/90 text-[9px] font-bold text-white text-center py-0.5">
                    MAIN
                  </span>
                )}
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="rounded-lg bg-white/20 p-1 text-white hover:bg-white/30 text-xs"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="rounded-lg bg-rose-500/80 p-1 text-white hover:bg-rose-500 text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      className="rounded-lg bg-white/20 p-1 text-white hover:bg-white/30 text-xs"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {images.length < 8 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-16 rounded-xl border-2 border-dashed border-white/15 bg-slate-950 text-slate-500 hover:border-brand-500/40 hover:text-brand-400 transition text-lg disabled:opacity-40"
              >
                +
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-slate-950 py-7 text-center hover:border-brand-500/40 transition disabled:opacity-40"
            >
              <span className="text-3xl">🖼️</span>
              <span className="text-sm font-semibold text-slate-300">Click to upload product image</span>
              <span className="text-xs text-slate-500">JPG, PNG, WEBP · Or use &quot;Paste Image URL&quot; above</span>
            </button>

            {/* Quick Sample Image Selection */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2.5">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Or pick a quick sample photo:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handleAddSampleImage(sample.url)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:border-brand-500/50 hover:text-white transition"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <label className="space-y-1.5 text-xs font-semibold text-slate-300 block">
        Short Description *
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief features or details..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 mt-1.5"
          required
        />
      </label>

      {/* Badge */}
      <label className="space-y-1.5 text-xs font-semibold text-slate-300 block">
        Badge / Tag (Optional)
        <input
          name="badge"
          value={form.badge}
          onChange={(e) => handleChange('badge', e.target.value)}
          placeholder="e.g. Best Seller, New, 20% OFF"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 mt-1.5"
        />
      </label>

      {/* Form Actions */}
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
          disabled={isUploading || isSaving}
          className="rounded-2xl bg-brand-600 hover:bg-brand-500 px-6 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-brand-600/30 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>{initialProduct ? 'Saving Changes...' : 'Publishing Product...'}</span>
            </>
          ) : (
            <span>{initialProduct ? 'Save Changes' : '+ Publish Product'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

