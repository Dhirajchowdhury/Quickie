import React from 'react';
import SectionHeading from '../ui/SectionHeading';

const steps = [
  {
    num: '01',
    title: 'Configure JSON',
    description: 'Define your data schema, tables, and forms using our intuitive JSON structure.',
  },
  {
    num: '02',
    title: 'Customize UI',
    description: 'Tweak the generated components. Add your own brand colors, logos, and specific logic.',
  },
  {
    num: '03',
    title: 'Deploy Instantly',
    description: 'Export clean React code or deploy directly to your infrastructure with one click.',
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-slate-50 px-6 border-y border-slate-200">
      <div className="max-w-7xl mx-auto">
        <SectionHeading 
          title="How it works" 
          description="Three simple steps to ship your next internal tool." 
        />
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-indigo-100 z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center shadow-md mb-6">
                <span className="text-xl font-bold text-indigo-600">{step.num}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
