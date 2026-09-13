import React, { useState } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';

interface AdBannerSlotProps {
  districtName?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ districtName = 'San Marco' }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      id="mobile-ad-banner-slot"
      className="w-full shrink-0 bg-[#0E0E12] border-t border-[#262630] py-1.5 px-3 flex items-center justify-center relative z-20 select-none shadow-lg"
    >
      {/* 320x50 Standard Mobile Ad Format Container */}
      <div className="w-full max-w-sm h-12 rounded-lg bg-gradient-to-r from-[#1A1A22] to-[#22222D] border border-[#333340] px-3 flex items-center justify-between gap-2 overflow-hidden shadow-inner">
        {/* Ad Tag & Creative Info */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158] uppercase tracking-wider shrink-0">
            Ad
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-[#FAF8F5] truncate leading-tight">
              Venice Historical Rowing & Gondola Pass
            </p>
            <p className="text-[10px] text-[#A6A49E] truncate">
              Location-targeted • Sponsored near {districtName}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href="#sponsor"
            onClick={(e) => e.preventDefault()}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#BA1B1D] hover:bg-[#9E1B1E] text-white transition-colors flex items-center gap-1"
          >
            <span>Learn</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
