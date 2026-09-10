"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/checkout');
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username or phone number and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error ?? 'Unable to sign in. Please verify your credentials.');
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
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-rose-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-slate-900/40 blur-[100px]" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-white/20 hover:bg-slate-800 hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Back to Store</span>
          </Link>

          <Link
            href="/register"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
          >
            Create Account →
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
                Welcome Back
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Sign in with your <span className="font-semibold text-slate-200">username</span> or <span className="font-semibold text-slate-200">phone number</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-base leading-none">⚠️</span>
                <span className="flex-1 font-medium">{error}</span>
              </div>
            )}

            {/* Username or Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Username or Phone Number *
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
                  placeholder="Enter your username or phone number"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/90 pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Enter your password"
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

            {/* Submit Button */}
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </button>

            {/* Switch to Register */}
            <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-brand-400 hover:text-brand-300 transition underline underline-offset-4"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>

        {/* Security / Trust footer */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <span>🔒</span>
          <span>Encrypted Session • Deen's Daily Hub Store</span>
        </div>
      </div>
    </main>
  );
}
