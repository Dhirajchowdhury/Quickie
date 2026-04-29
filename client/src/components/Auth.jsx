import React, { useState } from 'react';
import api from '../api';
import Logo from './ui/Logo';
import Input from './ui/Input';
import Button from './ui/Button';

export default function Auth({ onLogin, onBack }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation / errors
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (!isLogin && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const toggleMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    setErrors({});
    setGlobalError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-6 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-md">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 relative">
          {onBack && (
            <button 
              onClick={onBack} 
              className="absolute left-0 top-0 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
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
          <p className="text-slate-600 mt-2 text-center">
            {isLogin ? 'Sign in to your Quickie workspace' : 'Start building internal tools today'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
          {/* Gradient accent top bar */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)' }}
          />
          <div className="p-8">
          {globalError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {globalError}
            </div>
          )}

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

            <div className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full shadow-lg shadow-indigo-200"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </div>
          </form>
          </div>
        </div>

        {/* Footer link */}
        <p className="mt-8 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
