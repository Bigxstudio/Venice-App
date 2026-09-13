import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

interface SplashIntroProps {
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({
  onDismiss,
  title = 'Venice Echoes',
  subtitle = 'Historic Image Map'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 450);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="splash-screen-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          onClick={handleDismiss}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0B0B0F] text-[#FAF8F5] cursor-pointer select-none overflow-hidden"
        >
          {/* 1. Black & White Architectural Background (Doge's Palace Arcade & Archangel Gabriel) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              initial={{ scale: 1.02, opacity: 0.8 }}
              animate={{ scale: 1.06, opacity: 0.95 }}
              transition={{ duration: 7, ease: 'easeOut' }}
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('/images/startup_bg.jpg')`
              }}
            />
            {/* Chiaroscuro Atmospheric Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/95 via-[#0B0B0F]/45 to-[#0B0B0F]/75" />
            <div className="absolute inset-0 bg-black/25" />
          </div>

          {/* Top Venetian Heritage Tag */}
          <div className="relative z-10 w-full pt-8 px-6 flex justify-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181820]/80 border border-[#D4AF37]/35 backdrop-blur-md text-[#E5C158] text-[11px] font-medium tracking-widest uppercase shadow-lg"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C158] animate-pulse" />
              <span>Serenissima Repubblica • 6 Sestieri • 325 Archive Views</span>
            </motion.div>
          </div>

          {/* 2. Floating Flag & Title Group */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
          >
            {/* Gentle Floating Motion for Flag & Ambient Glow */}
            <motion.div
              animate={{ y: [-5, 6, -5] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="relative mb-6 flex flex-col items-center"
            >
              {/* Warm Golden/Crimson Republic Ambient Glow */}
              <div className="absolute -inset-6 bg-gradient-to-r from-[#BA1B1D]/45 via-[#D4AF37]/35 to-[#BA1B1D]/45 rounded-3xl blur-2xl opacity-80" />
              
              <div className="relative p-3.5 sm:p-4 rounded-2xl bg-[#14141C]/85 border border-[#D4AF37]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col items-center transition-transform hover:scale-[1.02]">
                <img
                  src="/images/venice_flag.svg"
                  alt="Flag of the Most Serene Republic of Venice"
                  className="w-56 sm:w-72 h-auto object-contain filter drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* Floating Title & Subtitle */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#FAF8F5] tracking-tight mb-2 drop-shadow-lg">
                {title}
              </h1>

              <p className="text-xs sm:text-sm font-sans text-[#E5C158] tracking-[0.25em] uppercase font-semibold mb-3 drop-shadow-sm">
                {subtitle}
              </p>

              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-3 opacity-75" />

              <p className="text-xs text-[#C5C3BE] tracking-wider font-light max-w-xs">
                Palazzo Ducale • Piazza San Marco • 1750–1920
              </p>
            </motion.div>
          </motion.div>

          {/* 3. Bottom Enter CTA & Dismiss Indicator */}
          <div className="relative z-10 pb-9 flex flex-col items-center gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onClick={handleDismiss}
              className="px-5 py-2 rounded-full bg-[#181820]/90 hover:bg-[#BA1B1D] border border-[#D4AF37]/50 text-[#FAF8F5] text-xs font-serif tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <span>Explore Historic Venice</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </motion.button>
            <span className="text-[11px] text-[#A6A49E] tracking-widest uppercase font-mono">
              Tap anywhere to enter
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
