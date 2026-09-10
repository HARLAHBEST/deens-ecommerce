"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const { items } = useCart();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/checkout');
    }
  }, [user, router]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !phone.trim() || !password) {
      setError('Please fill in all required fields (username, phone number, and password).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const itemsToAttach = items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const result = await register(
        {
          name: username.trim(),
          phone: phone.trim(),
          password,
        },
        itemsToAttach
      );

      if (!result.success) {
        setError(result.error ?? 'Unable to create account.');
        setIsLoading(false);
        return;
      }

      router.push('/checkout');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 overflow-hidden sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-rose-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-slate-900/40 blur-[100px]" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-white/20 hover:bg-slate-800 hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Back to Store</span>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
          >
            Sign In Instead →
          </Link>
        </div>

        {/* Auth Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10 relative overflow-hidden">
          {/* Subtle top highlight gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-black text-2xl shadow-lg shadow-brand-600/30">
              D
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Create Account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Join <span className="font-semibold text-slate-200">Deen's Daily Hub</span> with your username & phone number
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-base leading-none">⚠️</span>
                <span className="flex-1 font-medium">{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Username *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  👤
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoFocus
                  placeholder="Choose a username"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/90 pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Phone Number *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  📱
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  placeholder="Enter phone number (e.g. +234 801 234 5678)"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/90 pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <p className="text-[11px] text-slate-500 pl-1">
                You can use either your username or this phone number to log in anytime.
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Create your password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/90 pl-11 pr-11 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Confirm Password
                </label>
                {confirmPassword && (
                  <span className={`text-[11px] font-semibold ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {passwordsMatch ? '✓ Matches' : '✗ Does not match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  placeholder="Confirm your password"
                  className={`w-full rounded-2xl border bg-slate-950/90 pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20'
                      : confirmPassword && passwordsMatch
                      ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/30 transition hover:from-brand-500 hover:to-brand-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>
            </div>

            {/* Switch to Login */}
            <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-brand-400 hover:text-brand-300 transition underline underline-offset-4"
              >
                Sign in here
              </Link>
            </div>
          </form>
        </div>

        {/* Security / Trust footer */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <span>🔒</span>
          <span>Instant Setup • No Credit Card Required</span>
        </div>
      </div>
    </main>
  );
}
