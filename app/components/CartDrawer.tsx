import Link from 'next/link';
import type { Product } from '@/data/products';

type CartItem = {
  product: Product;
  quantity: number;
};

type CartDrawerProps = {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
};

export function CartDrawer({ open, items, onClose, onQuantityChange, onRemove }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 149 ? 0 : subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-slate-950/95 shadow-2xl transition-all duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Your cart</p>
            <h2 className="text-2xl font-semibold text-white">Ready to checkout</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-white">
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
              Your cart is empty. Add premium picks to continue.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-start gap-4">
                  <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-3xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{item.product.category}</p>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-rose-400 transition hover:text-rose-200"
                        onClick={() => onRemove(item.product.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-3 py-2">
                        <button
                          type="button"
                          className="text-brand-300 transition hover:text-brand-100"
                          onClick={() => onQuantityChange(item.product.id, Math.max(1, item.quantity - 1))}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="text-brand-300 transition hover:text-brand-100"
                          onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold text-white">${item.product.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          {items.length === 0 ? (
            <button
              type="button"
              className="mt-5 w-full rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-400"
              disabled
            >
              Add items to checkout
            </button>
          ) : (
            <Link
              href="/checkout"
              className="mt-5 inline-flex w-full justify-center rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Proceed to checkout
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
