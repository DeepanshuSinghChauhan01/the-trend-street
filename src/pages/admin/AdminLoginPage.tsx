import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { isSupabaseConfigured } from '../../lib/supabase.js';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await adminLogin(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#121215] border border-zinc-800 p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
            Store Administration
          </h1>
          <p className="text-xs text-zinc-400">
            TREND STREET Mainpuri Management Portal
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2 rounded">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env before logging in.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 rounded">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@trendstreet.in"
              autoComplete="username"
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isSupabaseConfigured}
            className="w-full py-3.5 bg-white text-zinc-950 font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
          <span>Authenticated via Supabase &middot; role-gated by profiles.role</span>
        </div>
      </div>
    </div>
  );
};
