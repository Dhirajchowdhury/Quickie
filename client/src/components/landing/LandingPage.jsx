import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Footer from './Footer';

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar onLoginClick={onLogin} onSignupClick={onSignup} />
      <main>
        <Hero onGetStartedClick={onSignup} />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
