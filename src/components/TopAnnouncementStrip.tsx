import React from 'react';
import { Sparkles, ArrowRight, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { AnnouncementStrip } from '../types';

interface TopAnnouncementStripProps {
  announcement: AnnouncementStrip | null;
  onOpenAdmin?: () => void;
  onDismiss?: () => void;
}

export const TopAnnouncementStrip: React.FC<TopAnnouncementStripProps> = ({
  announcement,
  onOpenAdmin,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!announcement || !announcement.isActive || !isVisible) {
    return null;
  }

  const handleActionClick = (e: React.MouseEvent) => {
    if (announcement.link.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(announcement.link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      id="top-announcement-strip"
      className="relative bg-[#FF6B35] text-white text-[11px] font-bold py-2 sm:py-2.5 px-3 sm:px-4 shadow-sm transition-all duration-300 z-50 uppercase tracking-wider sm:tracking-widest w-full max-w-full overflow-hidden whitespace-normal text-center"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 w-full max-w-full">
        {/* Left Badge & Content */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 mx-auto sm:mx-0 flex-wrap justify-center sm:justify-start text-center sm:text-left w-full sm:w-auto overflow-hidden">
          <span className="animate-pulse text-white shrink-0">●</span>

          {announcement.badge && (
            <span
              id="announcement-badge"
              className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
            >
              {announcement.badge}
            </span>
          )}

          <a
            id="announcement-link-text"
            href={announcement.link}
            onClick={handleActionClick}
            className="hover:underline tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer group whitespace-normal break-words text-center sm:text-left inline"
          >
            <span>{announcement.text}</span>
            <ArrowRight className="w-3.5 h-3.5 inline-block group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
          </a>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {onOpenAdmin && (
            <button
              id="announcement-manage-btn"
              onClick={onOpenAdmin}
              className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors border border-white/20 uppercase tracking-wider"
              title="Manage live announcement strips in Admin Panel"
            >
              Manage Strips
            </button>
          )}

          <button
            id="announcement-dismiss-btn"
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
