import React from 'react';

export default function SectionHeading({ title, description, className = '' }) {
  return (
    <div className={`text-center max-w-2xl mx-auto mb-16 ${className}`}>
      <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
      {description && <p className="text-slate-600">{description}</p>}
    </div>
  );
}
