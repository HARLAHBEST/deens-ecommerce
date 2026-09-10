import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ProductProvider } from './providers/ProductProvider';
import { CartProvider } from './providers/CartProvider';
import { AuthProvider } from './providers/AuthProvider';

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Deen's Daily Hub | Online Store",
  description: "Shop quality lifestyle essentials, gadgets, and everyday goods with fast ordering and friendly customer support.",
  openGraph: {
    title: "Deen's Daily Hub",
    description: "Shop quality lifestyle essentials and everyday goods.",
    type: 'website',
    siteName: "Deen's Daily Hub",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <ProductProvider>
            <CartProvider>{children}</CartProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
