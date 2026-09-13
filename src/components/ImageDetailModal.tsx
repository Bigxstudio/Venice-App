import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoricalImage } from '../types';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Maximize2, 
  ShieldCheck, 
  Compass, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface ImageDetailModalProps {
  image: HistoricalImage | null;
  images?: HistoricalImage[] | null;
  onClose: () => void;
  onLocateOnMap?: (image: HistoricalImage) => void;
  onSelectImage?: (image: HistoricalImage) => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  images,
  onClose,
  onLocateOnMap,
  onSelectImage
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Derive full group list: use images array if provided, otherwise fallback to single image
  const imageList = (images && images.length > 0) ? images : (image ? [image] : []);
  const currentIndex = image ? Math.max(0, imageList.findIndex((img) => img.id === image.id)) : 0;
  const activeImage = imageList[currentIndex] || image;

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Reset error & fullscreen when active image changes
  useEffect(() => {
    setImgError(false);
  }, [activeImage?.id]);

  // Navigate to previous image in group
  const handlePrev = () => {
    if (imageList.length <= 1) return;
    const prevIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    if (onSelectImage) {
      onSelectImage(imageList[prevIndex]);
    }
  };

  // Navigate to next image in group
  const handleNext = () => {
    if (imageList.length <= 1) return;
    const nextIndex = (currentIndex + 1) % imageList.length;
    if (onSelectImage) {
      onSelectImage(imageList[nextIndex]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImage?.id, currentIndex, imageList.length, isFullscreen]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect intentional horizontal swipe (>40px)
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!activeImage) return null;

  const isPainting = activeImage.mediaType === 'painting' || activeImage.category === 'painting';
  const rawCreator = activeImage.creator || '';
  const formattedCreator = (!rawCreator || rawCreator.toLowerCase() === 'unknown' || rawCreator.toLowerCase().includes('unknown venetian photographer'))
    ? (isPainting ? 'Unknown Artist' : 'Unknown Photographer')
    : rawCreator.replace(/Unknown Venetian Photographer/gi, 'Unknown Photographer');

  // Display URL
  const displaySrc = (imgError || !activeImage.imageUrl)
    ? (activeImage.previewFallbackUrl || 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80')
    : activeImage.imageUrl;

  const hasMultiple = imageList.length > 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-end">
        {/* Backdrop for click away */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/65 backdrop-blur-xs pointer-events-auto"
        />

        {/* Bottom Sheet Card Container */}
        <motion.div
          id="image-detail-card"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl mx-auto bg-[#16161C] border-t border-[#2A2A36] rounded-t-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[88vh] overflow-hidden"
        >
          {/* Top Control Bar with Count & Navigation */}
          <div className="pt-2.5 pb-2 flex items-center justify-between px-4 border-b border-[#22222D]">
            {/* Multi-image indicator & quick next/prev */}
            {hasMultiple ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#E5C158] px-2.5 py-0.5 rounded-full bg-[#BA1B1D]/40 border border-[#D4AF37]/50 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{currentIndex + 1} of {imageList.length} at this spot</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-md text-[#C5C3BE] hover:text-[#FAF8F5] hover:bg-[#22222D] transition-colors cursor-pointer"
                    title="Previous Image (Swipe Right or ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-md text-[#C5C3BE] hover:text-[#FAF8F5] hover:bg-[#22222D] transition-colors cursor-pointer"
                    title="Next Image (Swipe Left or →)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#1A1A24] border border-[#2A2A38]">
                  Historical Record
                </span>
              </div>
            )}

            {/* Drag Handle Indicator */}
            <div className="w-8 h-1 rounded-full bg-[#333342] hidden sm:block" />

            {/* Close Button */}
            <button
              id="btn-close-detail"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#A6A49E] hover:text-[#FAF8F5] hover:bg-[#22222D] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[#FAF8F5]">
            {/* Visual Artwork Container with Swipe Support */}
            <div 
              className="relative w-full h-64 sm:h-76 rounded-xl bg-[#0D0D11] border border-[#262632] overflow-hidden group touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                key={activeImage.id}
                src={displaySrc}
                alt={activeImage.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain cursor-zoom-in select-none"
                onClick={() => setIsFullscreen(true)}
              />

              {/* Floating Left Arrow on Image (Multi-image mode) */}
              {hasMultiple && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer shadow-lg"
                  title="Previous (←)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Floating Right Arrow on Image (Multi-image mode) */}
              {hasMultiple && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer shadow-lg"
                  title="Next (→)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Fullscreen Trigger */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-[#121216]/85 text-[#FAF8F5] hover:bg-[#121216] border border-[#2E2E38] backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                title="View Full Resolution"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Mini-Thumbnail Strip for Quick Clicking */}
            {hasMultiple && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#A6A49E] px-1">
                  <span>Swipe photo or click thumbnail to browse:</span>
                  <span className="text-[#D4AF37] font-medium">{currentIndex + 1} of {imageList.length}</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
                  {imageList.map((thumbImg, tIdx) => {
                    const isThumbActive = tIdx === currentIndex;
                    const thumbSrc = thumbImg.previewFallbackUrl || thumbImg.imageUrl;
                    return (
                      <button
                        key={thumbImg.id}
                        onClick={() => onSelectImage && onSelectImage(thumbImg)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isThumbActive
                            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-105 shadow-md z-10'
                            : 'border-[#2E2E38] opacity-60 hover:opacity-100'
                        }`}
                        title={`${thumbImg.title} (${thumbImg.yearLabel || thumbImg.era})`}
                      >
                        <img
                          src={thumbSrc}
                          alt={thumbImg.title}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-center text-[#FAF8F5] py-0.5 font-mono">
                          {tIdx + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Title & Metadata Headers */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF8F5] leading-snug tracking-tight">
                {activeImage.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A6A49E]">
                <div className="flex items-center gap-1.5 text-[#E5C158]">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium text-[#FAF8F5]">{formattedCreator}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#C5C3BE]">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{activeImage.yearLabel || activeImage.era || 'Historical Era'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#A6A49E]">
                  <MapPin className="w-3.5 h-3.5 text-[#BA1B1D]" />
                  <span>{activeImage.sestiere || activeImage.district}</span>
                </div>
              </div>
            </div>

            {/* Historical Context / Curatorial Summary */}
            {activeImage.description && (
              <div className="text-xs sm:text-sm text-[#C5C3BE] leading-relaxed">
                <p>{activeImage.description}</p>
              </div>
            )}

            {/* Rights & Licensing Verification */}
            <div className="pt-2 border-t border-[#22222D] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8C8A84]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Original work over 100 years old • Public Domain</span>
              </div>
              <span className="font-mono text-[10px] text-[#6E6C68]">
                {activeImage.lat ? `${activeImage.lat.toFixed(4)}°N, ${activeImage.lng.toFixed(4)}°E` : ''}
              </span>
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="p-3 bg-[#121216] border-t border-[#22222D] flex items-center gap-2.5 shrink-0">
            {onLocateOnMap && (
              <button
                id="btn-center-on-map"
                onClick={() => {
                  onLocateOnMap(activeImage);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-[#BA1B1D] hover:bg-[#9E1B1E] text-white shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Center on Map</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Fullscreen Image Overlay View with Multi-Image Navigation */}
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 pointer-events-auto select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-[#1A1A22] text-[#FAF8F5] hover:bg-[#262632] border border-[#333342] transition-colors cursor-pointer z-50 shadow-lg"
              title="Close Fullscreen (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Fullscreen Floating Previous Button */}
            {hasMultiple && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#16161C]/80 hover:bg-[#16161C] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-50 shadow-2xl hover:scale-105 active:scale-95"
                title="Previous (← or Swipe Right)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Fullscreen Floating Next Button */}
            {hasMultiple && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#16161C]/80 hover:bg-[#16161C] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-50 shadow-2xl hover:scale-105 active:scale-95"
                title="Next (→ or Swipe Left)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
              <img
                src={displaySrc}
                alt={activeImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-center space-y-1">
                <h4 className="text-lg font-serif font-bold text-[#FAF8F5]">{activeImage.title}</h4>
                <p className="text-xs text-[#E5C158] font-medium">
                  {formattedCreator} • {activeImage.yearLabel}
                  {hasMultiple && ` • (${currentIndex + 1} of ${imageList.length})`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
