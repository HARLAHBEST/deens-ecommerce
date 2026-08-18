import type { Metadata } from 'next';
import './globals.css';
import { ProductProvider } from './providers/ProductProvider';
import { CartProvider } from './providers/CartProvider';
import { AuthProvider } from './providers/AuthProvider';

export const metadata: Metadata = {
  title: 'DeensDaily Hub',
  description: 'A modern, premium e-commerce experience built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>{children}</CartProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
