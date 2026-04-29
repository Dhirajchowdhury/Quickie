import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api';
import Logo from './ui/Logo';
import Input from './ui/Input';
import Button from './ui/Button';

/** Google "G" logo — inline SVG, no extra assets */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isLogin = mode === 'login';
  const googleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // ── Google login ────────────────────────────────────────────────────────
  // Single flow: auth-code popup → send code to backend → receive JWT
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',

    onSuccess: async ({ code }) => {
      setGlobalError('');
      try {
        const res = await api.post('/auth/google', { code });
        onLogin(res.data.token);
      } catch (err) {
        const msg = err.response?.data?.error || 'Google sign-in failed. Please try again.';
        setGlobalError(msg);
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: () => {
      setGoogleLoading(false);
      setGlobalError('Google sign-in failed. Please try again.');
    },

    // User closed the popup without completing auth — not an error
    onNonOAuthError: () => {
      setGoogleLoading(false);
    },
  });

  function handleGoogleClick() {
    setGlobalError('');
    setGoogleLoading(true);
    googleLogin();
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validateForm() {
    const newErrors = {};
    if (!isLogin && !name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (!isLogin && password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!isLogin && password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Email / password submit ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await api.post(`/auth/${mode}`, payload);
      onLogin(res.data.token);
    } catch (err) {
      setGlobalError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(isLogin ? 'signup' : 'login');
    setErrors({});
    setGlobalError('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-6 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-md">

        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-8 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-0 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <Logo size="lg" />
          <h2 className="text-2xl font-bold text-slate-900 mt-6">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-slate-500 mt-2 text-center text-sm">
            {isLogin ? 'Sign in to your Quickie workspace' : 'Start building internal tools today'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
          {/* Gradient accent bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)' }}
          />

          <div className="p-8">
            {/* Config warning — only shows when env var is missing */}
            {!googleConfigured && (
              <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>
                  <strong>Config missing:</strong> VITE_GOOGLE_CLIENT_ID is not set in{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">client/.env</code>.
                  Google sign-in is disabled.
                </span>
              </div>
            )}

            {/* Global error */}
            {globalError && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {globalError}
              </div>
            )}

            {/* Google button */}
            {googleConfigured && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="
                    w-full flex items-center justify-center gap-3
                    bg-white border border-slate-200 rounded-xl px-4 py-2.5
                    text-sm font-semibold text-slate-700
                    shadow-sm hover:bg-slate-50 hover:border-slate-300
                    transition-all duration-150
                    disabled:opacity-60 disabled:pointer-events-none
                  "
                >
                  {googleLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Connecting to Google…
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs font-medium text-slate-400">or continue with email</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
              </>
            )}

            {/* Email / password form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              {!isLogin && (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
              )}
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              {!isLogin && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                />
              )}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Toggle mode */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
