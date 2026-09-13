import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, ShieldCheck, Compass, X } from 'lucide-react';

interface LocationPrimerModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export const LocationPrimerModal: React.FC<LocationPrimerModalProps> = ({
  isOpen,
  onAllow,
  onDismiss
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="location-primer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          id="location-primer-dialog"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm bg-[#18181E] border border-[#2E2E38] rounded-2xl p-6 text-[#FAF8F5] shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Top Crimson Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BA1B1D] via-[#D4AF37] to-[#BA1B1D]" />

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1.5 text-[#A6A49E] hover:text-[#FAF8F5] hover:bg-[#262630] rounded-full transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-[#BA1B1D]/20 border border-[#BA1B1D]/40 flex items-center justify-center text-[#E5C158] mb-4 shadow-inner">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>

          <h3 className="text-xl font-serif font-bold text-[#FAF8F5] mb-2">
            Locate Historic Viewpoints
          </h3>

          <p className="text-sm text-[#C5C3BE] leading-relaxed mb-4">
            Enable location to reveal where you are standing in Venice relative to 19th-century paintings by Turner & Canaletto and vintage photographs by Carlo Naya.
          </p>

          <div className="space-y-2 mb-6 text-xs text-[#A6A49E] bg-[#121216] p-3 rounded-lg border border-[#262630]">
            <div className="flex items-center gap-2 text-[#C5C3BE]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Location data never leaves your device</span>
            </div>
            <div className="flex items-center gap-2 text-[#C5C3BE]">
              <Navigation className="w-4 h-4 text-[#BA1B1D] shrink-0" />
              <span>Real-time proximity alerts for nearby historic sites</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              id="btn-enable-gps"
              onClick={onAllow}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-[#BA1B1D] hover:bg-[#9E1B1E] text-white shadow-lg shadow-[#BA1B1D]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Navigation className="w-4 h-4" />
              <span>Enable Walking GPS</span>
            </button>

            <button
              id="btn-explore-manual"
              onClick={onDismiss}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-[#A6A49E] hover:text-[#FAF8F5] hover:bg-[#22222B] transition-colors cursor-pointer"
            >
              Explore Map Manually
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
