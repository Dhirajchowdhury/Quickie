import React from 'react';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Logo size="md" />
        </div>
        
        <div className="flex gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Quickie. All rights reserved.
      </div>
    </footer>
  );
}
