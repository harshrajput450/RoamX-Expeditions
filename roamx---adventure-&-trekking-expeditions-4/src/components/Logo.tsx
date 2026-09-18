import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8.5 h-8.5 sm:w-9 sm:h-9',
    lg: 'w-11 h-11',
  }[size];

  const textSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Modern RoamX Explorer Emblem */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-br from-[#004E64] to-[#002D3A] p-1.5 flex items-center justify-center shadow-md border ${
          isLight ? 'border-white/25 shadow-black/20' : 'border-[#004E64]/20'
        } relative group shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Subtle Mountain Backdrop */}
          <path
            d="M5 24L13 10L17 16L21 11L27 24H5Z"
            fill="white"
            fillOpacity="0.15"
          />
          {/* Left-to-Right Ascending Trail (Orange) */}
          <path
            d="M6 24L14 10L18 16L26 24"
            stroke="#FF6B35"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Intersecting Explorer 'X' Vector (Crisp White) */}
          <path
            d="M26 10L17 18L7 24"
            stroke="#FFFFFF"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Summit Star / Compass Pin */}
          <circle cx="14" cy="10" r="2.2" fill="#FF6B35" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      </div>

      {/* Brand Typography - Stacked layout with unboxed subtitle */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-black ${textSizes} tracking-tight leading-none ${
            isLight ? 'text-white' : 'text-[#004E64]'
          }`}
        >
          Roam<span className="text-[#FF6B35]">X</span>
        </span>
        {showSubtitle && (
          <span
            className={`text-[8px] sm:text-[9px] font-bold tracking-[0.22em] uppercase mt-0.5 leading-none ${
              isLight ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            EXPEDITIONS
          </span>
        )}
      </div>
    </div>
  );
};
