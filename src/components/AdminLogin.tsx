'use client';

import React, { useState } from 'react';
import { loginAdmin } from '@/app/admin/actions';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        // Reload to let the server layout pick up the cookie and show the admin pages
        window.location.reload();
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-accent/5">
        {/* Glow decoration */}
        <div className="absolute -inset-0.5 -z-10 rounded-xl bg-accent/10 opacity-30 blur-lg"></div>

        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent font-extrabold text-white text-lg shadow-lg shadow-accent/20 font-display">
            TS
          </span>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-white font-display">
            Admin Panel
          </h2>
          <p className="mt-2 text-sm text-zinc-400 font-normal">
            Enter the admin password to manage phone data
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 text-sm transition-all font-sans"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-900/50 bg-rose-950/30 px-4 py-3 text-xs font-semibold text-rose-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full h-12 items-center justify-center rounded-lg bg-accent hover:bg-accent-hover text-sm font-bold text-white hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-accent/10 cursor-pointer font-sans"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
