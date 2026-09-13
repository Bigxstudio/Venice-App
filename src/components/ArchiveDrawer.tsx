import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoricalImage } from '../types';
import { X, Search, Filter, MapPin, Compass, Image as ImageIcon } from 'lucide-react';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  images: HistoricalImage[];
  onSelectImage: (image: HistoricalImage) => void;
}

const SESTIERI_LIST = ['All', 'San Marco', 'San Polo', 'Santa Croce', 'Cannaregio', 'Dorsoduro', 'Castello'];

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  images,
  onSelectImage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSestiere, setSelectedSestiere] = useState('All');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'painting' | 'photo'>('all');

  const filteredList = useMemo(() => {
    return images.filter(img => {
      if (selectedMediaType !== 'all') {
        const isPainting = img.mediaType === 'painting' || img.category === 'painting';
        if (selectedMediaType === 'painting' && !isPainting) return false;
        if (selectedMediaType === 'photo' && isPainting) return false;
      }
      if (selectedSestiere !== 'All') {
        const s = (img.sestiere || img.district || '').toLowerCase();
        if (!s.includes(selectedSestiere.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = img.title.toLowerCase().includes(q);
        const matchesCreator = img.creator.toLowerCase().includes(q);
        const matchesCaption = (img.caption || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCreator && !matchesCaption) return false;
      }
      return true;
    });
  }, [images, selectedMediaType, selectedSestiere, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Slide-over Panel */}
        <motion.div
          id="collection-index-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md h-full bg-[#16161C] border-l border-[#2E2E38] text-[#FAF8F5] shadow-2xl flex flex-col z-10"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-[#262632] flex items-center justify-between bg-[#121216]">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#FAF8F5]">
                Image Index
              </h3>
              <p className="text-xs text-[#A6A49E]">
                {filteredList.length} of {images.length} verified records
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#A6A49E] hover:text-[#FAF8F5] hover:bg-[#262632] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-[#262632] bg-[#1A1A22] space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A6A49E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                placeholder="Search title, artist, or landmark..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121216] border border-[#2E2E38] text-base sm:text-xs text-[#FAF8F5] placeholder-[#807E78] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Sestieri Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {SESTIERI_LIST.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSestiere(s)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSestiere === s
                      ? 'bg-[#BA1B1D] text-white font-semibold'
                      : 'bg-[#121216] text-[#A6A49E] hover:text-[#FAF8F5] border border-[#2A2A34]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Media Type Toggles */}
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-[#121216] border border-[#262632] text-xs">
              <button
                onClick={() => setSelectedMediaType('all')}
                className={`py-1 rounded-md text-center transition-colors cursor-pointer ${
                  selectedMediaType === 'all'
                    ? 'bg-[#D4AF37] text-[#121216] font-semibold shadow-xs'
                    : 'text-[#A6A49E] hover:text-[#FAF8F5]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedMediaType('painting')}
                className={`py-1 rounded-md text-center transition-colors cursor-pointer ${
                  selectedMediaType === 'painting'
                    ? 'bg-[#D4AF37] text-[#121216] font-semibold shadow-xs'
                    : 'text-[#A6A49E] hover:text-[#FAF8F5]'
                }`}
              >
                🎨 Paintings
              </button>
              <button
                onClick={() => setSelectedMediaType('photo')}
                className={`py-1 rounded-md text-center transition-colors cursor-pointer ${
                  selectedMediaType === 'photo'
                    ? 'bg-[#D4AF37] text-[#121216] font-semibold shadow-xs'
                    : 'text-[#A6A49E] hover:text-[#FAF8F5]'
                }`}
              >
                📷 Photos
              </button>
            </div>
          </div>

          {/* Records Grid */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-[#22222D]">
            {filteredList.map((item) => {
              const isPainting = item.mediaType === 'painting' || item.category === 'painting';
              const displayThumb = item.previewFallbackUrl || 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=300&q=80';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectImage(item);
                    onClose();
                  }}
                  className="pt-2.5 flex items-center gap-3 cursor-pointer group hover:bg-[#1F1F2A] p-2 rounded-xl transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg bg-[#0D0D11] border border-[#2E2E38] overflow-hidden shrink-0">
                    <img
                      src={displayThumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-1.5 py-0.2 text-[9px] rounded font-semibold uppercase ${
                        isPainting ? 'bg-[#D4AF37]/20 text-[#E5C158]' : 'bg-[#3B82F6]/20 text-[#60A5FA]'
                      }`}>
                        {isPainting ? 'Painting' : 'Photo'}
                      </span>
                      <span className="text-[10px] text-[#A6A49E]">
                        {item.sestiere || item.district}
                      </span>
                    </div>

                    <h4 className="text-xs font-serif font-bold text-[#FAF8F5] truncate group-hover:text-[#E5C158] transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-[#C5C3BE] truncate">
                      {item.creator} • {item.yearLabel}
                    </p>
                  </div>

                  <button
                    className="p-2 rounded-lg bg-[#121216] border border-[#2E2E38] text-[#D4AF37] hover:bg-[#BA1B1D] hover:text-white transition-colors shrink-0 cursor-pointer"
                    title="Show on Map"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="py-12 text-center text-xs text-[#807E78]">
                No historical records match your search or filter.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
