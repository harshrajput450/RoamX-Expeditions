import React from 'react';
import { Check, X, ShieldCheck, HelpCircle } from 'lucide-react';
import { Trip } from '../types';

interface InclusionsExclusionsProps {
  trip: Trip;
}

export const InclusionsExclusions: React.FC<InclusionsExclusionsProps> = ({ trip }) => {
  return (
    <section id="inclusions-exclusions" className="py-12 bg-[#F8F9FA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
            Transparency Guaranteed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            What is Included & Excluded
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            No hidden charges or surprise costs. Everything needed for a safe, unforgettable expedition is covered.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Inclusions Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004E64] flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">What's Included in Package</h3>
                <p className="text-xs text-[#004E64] font-medium">Included at no extra charge</p>
              </div>
            </div>

            <ul className="space-y-3">
              {trip.inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-[#004E64] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">What's Not Included</h3>
                <p className="text-xs text-rose-600 font-medium">Optional personal expenses</p>
              </div>
            </div>

            <ul className="space-y-3">
              {trip.exclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};
