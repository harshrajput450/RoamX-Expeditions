import React from 'react';

interface BookingLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'orange' | 'teal' | 'white' | 'badge';
}

export const BookingLogo: React.FC<BookingLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  variant = 'orange',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: '#FFFFFF',
          secondary: 'rgba(255,255,255,0.7)',
          accent: '#FF6B35',
        };
      case 'teal':
        return {
          primary: '#004E64',
          secondary: '#25A18E',
          accent: '#FF6B35',
        };
      case 'badge':
        return {
          primary: '#FF6B35',
          secondary: '#004E64',
          accent: '#FFFFFF',
        };
      case 'orange':
      default:
        return {
          primary: '#FF6B35',
          secondary: '#FFA07A',
          accent: '#004E64',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[size]}
      >
        {/* Ticket / Pass Base with Notches */}
        <path
          d="M4 8C4 6.89543 4.89543 6 6 6H26C27.1046 6 28 6.89543 28 8V13C26.3431 13 25 14.3431 25 16C25 17.6569 26.3431 19 28 19V24C28 25.1046 27.1046 26 26 26H6C4.89543 26 4 25.1046 4 24V19C5.65685 19 7 17.6569 7 16C7 14.3431 5.65685 13 4 13V8Z"
          fill={colors.primary}
          fillOpacity={variant === 'white' ? '0.2' : '0.15'}
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Mountain Silhouette Inside Ticket */}
        <path
          d="M8 21L13 14L16 18L19 13L24 21H8Z"
          fill={colors.primary}
          fillOpacity={variant === 'white' ? '0.9' : '0.85'}
        />

        {/* Instant Booking Lightning / Checkmark Spark */}
        <path
          d="M17 9L13.5 15H17.5L15 20"
          stroke={variant === 'white' ? '#FFFFFF' : '#FF6B35'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Verified Star / Compass Point */}
        <circle cx="23" cy="10" r="1.5" fill={variant === 'white' ? '#FFFFFF' : '#004E64'} />
      </svg>

      {showText && (
        <span className="font-extrabold tracking-wider uppercase text-[11px] leading-none">
          ROAM<span className="text-[#FF6B35]">X</span> BOOKING
        </span>
      )}
    </div>
  );
};
