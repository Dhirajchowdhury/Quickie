import React from 'react';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

export default function Navbar({ onLoginClick, onSignupClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Logo size="lg" />
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onLoginClick}>
            Log in
          </Button>
          <Button variant="primary" size="sm" onClick={onSignupClick}>
            Sign up
          </Button>
        </div>
      </div>
    </nav>
  );
}
