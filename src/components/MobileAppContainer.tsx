import React, { useState, useEffect } from 'react';
import { HistoricalImage, VeniceDistrict, UserLocation, Category, AdBanner } from '../types';
import { VeniceMap } from './VeniceMap';
import { ImageDetailModal } from './ImageDetailModal';
import { Map, Grid, Compass, Smartphone, Search, Filter, Navigation, Layers, Sparkles, X, Volume2, ShieldCheck, Zap, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileAppContainerProps {
  images: HistoricalImage[];
  districts: VeniceDistrict[];
  ads: AdBanner[];
  onSelectImage: (image: HistoricalImage) => void;
  selectedImage: HistoricalImage | null;
  onCloseImageModal: () => void;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({
  images,
  districts,
  ads,
  onSelectImage,
  selectedImage,
  onCloseImageModal
}) => {
  // Mobile Frame Device State
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'android' | 'full'>('iphone');
  const [activeTab, setActiveTab] = useState<'map' | 'gallery' | 'radar'>('map');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // GPS Location State (Simulated Venetian Wanderer or Real Browser GPS)
  const [userLocation, setUserLocation] = useState<UserLocation | null>({
    lat: 45.4338, // Piazza San Marco baseline
    lng: 12.3387,
    isSimulated: true
  });

  // GPS Simulation Spots
  const GPS_PRESETS = [
    { name: "Piazza San Marco", lat: 45.4338, lng: 12.3387 },
    { name: "Rialto Bridge", lat: 45.4380, lng: 12.3358 },
    { name: "Grand Canal / Salute", lat: 45.4312, lng: 12.3361 },
    { name: "Ca' d'Oro (Cannaregio)", lat: 45.4410, lng: 12.3338 },
    { name: "Campo Santa Margherita", lat: 45.4348, lng: 12.3240 },
    { name: "Arsenale Gate", lat: 45.4352, lng: 12.3498 }
  ];

  // Map Tile Style
  const [tileStyle, setTileStyle] = useState<'historic' | 'voyager' | 'satellite'>('historic');

  // Ad Support Simulation Engine
  const [isAdSupported, setIsAdSupported] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showSplashAd, setShowSplashAd] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Rotate banner ads periodically
  useEffect(() => {
    if (!isAdSupported || ads.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
      setBannerDismissed(false);
    }, 18000);
    return () => clearInterval(interval);
  }, [isAdSupported, ads]);

  // Handle Real Geolocation
  const handleEnableRealGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isSimulated: false
          });
        },
        err => {
          console.warn('Geolocation warning:', err.message);
          alert('Could not retrieve browser GPS. Using Venetian location simulator instead.');
        }
      );
    }
  };

  // Filter Images
  const filteredImages = images.filter(img => {
    const matchesCat = selectedCategory === 'all' || img.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || img.district === selectedDistrict;
    const matchesQuery = searchQuery === '' ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDistrict && matchesQuery;
  });

  // Calculate Nearby Historical Images (< 200 meters)
  const nearbyImages = userLocation ? images.filter(img => {
    const R = 6371e3;
    const φ1 = (userLocation.lat * Math.PI) / 180;
    const φ2 = (img.lat * Math.PI) / 180;
    const Δφ = ((img.lat - userLocation.lat) * Math.PI) / 180;
    const Δλ = ((img.lng - userLocation.lng) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= 300;
  }) : [];

  const currentAd = ads[currentAdIndex] || ads[0];

  return (
    <div className="relative w-full h-full bg-[#FDFBF7] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden text-[#2D241E]">
      {/* Top Device Frame Switcher Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2 text-xs text-[#2D241E]">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-serif italic font-semibold text-[#1A3A3A]">Mobile Simulator Mode:</span>
          <div className="bg-[#1A3A3A] border border-[#D4AF37]/30 rounded p-0.5 flex items-center gap-1 text-[#FDFBF7]">
            <button
              onClick={() => setDeviceFrame('iphone')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                deviceFrame === 'iphone' ? 'bg-[#D4AF37] text-[#1A3A3A] font-bold shadow-sm' : 'hover:bg-[#132E2E] text-[#FDFBF7]/70'
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setDeviceFrame('android')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                deviceFrame === 'android' ? 'bg-[#D4AF37] text-[#1A3A3A] font-bold shadow-sm' : 'hover:bg-[#132E2E] text-[#FDFBF7]/70'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setDeviceFrame('full')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                deviceFrame === 'full' ? 'bg-[#D4AF37] text-[#1A3A3A] font-bold shadow-sm' : 'hover:bg-[#132E2E] text-[#FDFBF7]/70'
              }`}
            >
              Full Screen
            </button>
          </div>
        </div>

        {/* Ad-Supported Simulation Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#2D241E]/70 hidden sm:inline">Ad Support:</span>
          <button
            onClick={() => setIsAdSupported(!isAdSupported)}
            className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer flex items-center gap-1 ${
              isAdSupported
                ? 'bg-[#1A3A3A] text-[#D4AF37] border-[#D4AF37]/40'
                : 'bg-emerald-900/10 text-emerald-800 border-emerald-600/40'
            }`}
          >
            {isAdSupported ? 'Ad-Supported Free' : 'Ad-Free VIP'}
          </button>
          {isAdSupported && (
            <button
              onClick={() => setShowSplashAd(true)}
              className="px-2 py-1 bg-[#1A3A3A] hover:bg-[#132E2E] text-[#D4AF37] text-[10px] rounded-sm border border-[#D4AF37]/30 transition-colors"
              title="Test Splash Screen Ad"
            >
              Trigger Splash Ad
            </button>
          )}
        </div>
      </div>

      {/* DEVICE FRAME WRAPPER */}
      <div
        className={`relative transition-all duration-300 overflow-hidden bg-[#FDFBF7] flex flex-col justify-between ${
          deviceFrame === 'iphone'
            ? 'w-[375px] h-[740px] rounded-[48px] border-[10px] border-[#1A3A3A] shadow-2xl ring-1 ring-[#D4AF37]/40'
            : deviceFrame === 'android'
            ? 'w-[380px] h-[750px] rounded-[36px] border-[8px] border-[#1A3A3A] shadow-2xl ring-1 ring-[#D4AF37]/40'
            : 'w-full h-full max-w-5xl rounded-lg border border-[#D4AF37]/30 shadow-2xl'
        }`}
      >
        {/* Dynamic Island / Notch for phone frames */}
        {deviceFrame !== 'full' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-28 h-4 bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A3A3A] border border-slate-800 mr-2"></div>
            <div className="w-2 h-2 rounded-full bg-[#D4AF37]/40"></div>
          </div>
        )}

        {/* Mobile Header Navigation Bar */}
        <div className="bg-[#1A3A3A] text-[#FDFBF7] pt-7 pb-3 px-4 shadow-md z-20 flex flex-col gap-2 border-b border-[#D4AF37]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <h1 className="text-base font-bold font-serif italic tracking-tight text-[#FDFBF7]">
                Serenissima
              </h1>
            </div>

            {/* GPS Simulation Selector Dropdown */}
            <select
              value={userLocation?.lat ? `${userLocation.lat},${userLocation.lng}` : ''}
              onChange={e => {
                const [lat, lng] = e.target.value.split(',').map(Number);
                setUserLocation({ lat, lng, isSimulated: true });
              }}
              className="bg-[#132E2E] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] rounded-sm px-2 py-1 focus:outline-none"
            >
              <option value="">GPS Location: Select Spot</option>
              {GPS_PRESETS.map((spot, i) => (
                <option key={i} value={`${spot.lat},${spot.lng}`}>📍 {spot.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Canaletto, Titian, Rialto, photos..."
              className="w-full bg-[#132E2E] border border-[#D4AF37]/30 text-xs rounded-sm pl-8 pr-3 py-1.5 text-[#FDFBF7] placeholder-[#FDFBF7]/50 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Artifacts' },
              { id: 'photograph', label: '📷 Photos' },
              { id: 'painting', label: '🎨 Paintings' },
              { id: 'map', label: '📜 Maps' },
              { id: 'sketch', label: '✏️ Sketches' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#1A3A3A] font-bold shadow-xs'
                    : 'bg-[#132E2E] text-[#FDFBF7]/80 hover:bg-[#1A3A3A] hover:text-[#D4AF37]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Proximity Alert Banner if near historical photo */}
        {nearbyImages.length > 0 && activeTab === 'map' && (
          <div className="bg-[#1A3A3A] text-[#FDFBF7] text-[11px] py-1.5 px-3 z-20 flex items-center justify-between border-b border-[#D4AF37]/40 shadow-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 animate-spin" />
              <span className="truncate">Nearby ({nearbyImages.length}): <strong className="text-[#D4AF37]">{nearbyImages[0].title}</strong> ({nearbyImages[0].yearLabel})</span>
            </div>
            <button
              onClick={() => onSelectImage(nearbyImages[0])}
              className="px-2 py-0.5 bg-[#D4AF37] text-[#1A3A3A] font-bold rounded-sm text-[10px] whitespace-nowrap ml-2 cursor-pointer"
            >
              View
            </button>
          </div>
        )}

        {/* MAIN BODY VIEWPORT */}
        <div className="relative flex-1 bg-[#FDFBF7] overflow-hidden">
          {/* VIEW 1: MAP VIEW */}
          {activeTab === 'map' && (
            <div className="w-full h-full relative">
              <VeniceMap
                images={filteredImages}
                selectedImage={selectedImage}
                onSelectImage={onSelectImage}
                userLocation={userLocation}
                tileStyle={tileStyle}
                onTileStyleChange={setTileStyle}
              />
            </div>
          )}

          {/* VIEW 2: HISTORIC GALLERY FEED */}
          {activeTab === 'gallery' && (
            <div className="w-full h-full overflow-y-auto p-3 space-y-3 bg-[#FDFBF7]">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                <span className="text-xs font-bold text-[#1A3A3A] uppercase tracking-[0.15em] font-serif italic">
                  Historical Collection Index ({filteredImages.length})
                </span>
                <span className="text-[10px] text-[#2D241E]/60 font-mono">Sorted by Year</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredImages.map(img => (
                  <div
                    key={img.id}
                    onClick={() => onSelectImage(img)}
                    className="bg-white rounded-sm p-3 border border-[#E5E0D8] hover:border-[#D4AF37] shadow-sm transition-all cursor-pointer flex gap-3 group"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 object-cover rounded-sm border border-[#E5E0D8] shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-1.5 py-0.5 bg-[#1A3A3A] text-[#D4AF37] font-bold text-[9px] rounded-sm uppercase tracking-wider">
                            {img.category}
                          </span>
                          <span className="text-[10px] font-semibold text-[#1A3A3A]">{img.yearLabel}</span>
                          <span className="text-[10px] text-[#2D241E]/60 font-medium ml-auto">{img.district}</span>
                        </div>
                        <h3 className="text-xs font-bold font-serif text-[#1A3A3A] line-clamp-1 group-hover:text-[#D4AF37] transition-colors">{img.title}</h3>
                        <p className="text-[11px] text-[#2D241E]/70 line-clamp-1 mt-0.5 italic">{img.creator}</p>
                        <p className="text-[11px] text-[#2D241E]/60 line-clamp-2 mt-1">{img.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#D4AF37] font-semibold pt-1">
                        <span>Tap for historical detail</span>
                        <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: RADAR / PROXIMITY GUIDE */}
          {activeTab === 'radar' && (
            <div className="w-full h-full overflow-y-auto p-4 bg-[#FDFBF7]">
              <div className="text-center py-3 border-b border-[#E5E0D8] mb-3">
                <Compass className="w-8 h-8 text-[#D4AF37] mx-auto mb-1 animate-pulse" />
                <h2 className="text-base font-bold font-serif italic text-[#1A3A3A]">Venetian Proximity Radar</h2>
                <p className="text-xs text-[#2D241E]/70">Discover historical artworks near your current GPS location</p>
              </div>

              {/* GPS Presets Bar */}
              <div className="bg-[#1A3A3A] text-[#FDFBF7] p-3 rounded-sm border border-[#D4AF37]/30 mb-4">
                <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-2">Simulate Walking in Venice:</span>
                <div className="flex flex-wrap gap-1.5">
                  {GPS_PRESETS.map((spot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserLocation({ lat: spot.lat, lng: spot.lng, isSimulated: true })}
                      className="px-2.5 py-1 bg-[#132E2E] text-[#FDFBF7] hover:bg-[#D4AF37] hover:text-[#1A3A3A] rounded-sm text-[11px] font-medium border border-[#D4AF37]/20 transition-colors cursor-pointer"
                    >
                      {spot.name}
                    </button>
                  ))}
                  <button
                    onClick={handleEnableRealGPS}
                    className="px-2.5 py-1 bg-[#D4AF37] text-[#1A3A3A] font-bold rounded-sm text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Real Phone GPS</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1A3A3A] uppercase tracking-wider font-serif">Nearby Historical Artifacts</h3>
                {nearbyImages.length === 0 ? (
                  <div className="p-6 bg-white rounded-sm border border-dashed border-[#E5E0D8] text-center text-xs text-[#2D241E]/60">
                    No historical image markers within 300 meters of this spot. Try selecting "Piazza San Marco" or "Rialto Bridge" above!
                  </div>
                ) : (
                  nearbyImages.map(img => (
                    <div
                      key={img.id}
                      onClick={() => onSelectImage(img)}
                      className="p-3 bg-white rounded-sm border border-[#E5E0D8] hover:border-[#D4AF37] shadow-xs flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-sm shrink-0 border border-[#E5E0D8]"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase">{img.category} &bull; {img.yearLabel}</span>
                        <h4 className="text-xs font-bold font-serif text-[#1A3A3A] truncate">{img.title}</h4>
                        <p className="text-[11px] text-[#2D241E]/70 truncate italic">{img.creator}</p>
                      </div>
                      <button className="p-1.5 bg-[#1A3A3A] text-[#D4AF37] rounded-sm shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM AD BANNER (IF AD SUPPORTED) */}
        {isAdSupported && !bannerDismissed && currentAd && (
          <div className="bg-[#1A3A3A] text-[#FDFBF7] p-2.5 border-t border-[#D4AF37]/30 flex items-center gap-2.5 shadow-xl relative z-20">
            <span className="absolute top-1 left-2 text-[8px] font-extrabold uppercase tracking-widest text-[#D4AF37] bg-[#132E2E] px-1 rounded border border-[#D4AF37]/30">
              SPONSORED
            </span>
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-cover rounded-sm border border-[#D4AF37]/30 shrink-0 mt-2"
            />
            <div className="flex-1 min-w-0 mt-1">
              <h4 className="text-[11px] font-bold text-[#D4AF37] font-serif truncate">{currentAd.title}</h4>
              <p className="text-[10px] text-[#FDFBF7]/80 truncate">{currentAd.subtitle}</p>
              <span className="text-[9px] text-[#FDFBF7]/50 font-mono">{currentAd.sponsor}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-[#FDFBF7]/60 hover:text-white p-0.5 cursor-pointer"
                title="Hide Ad"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert(`Ad Action: Redirecting to ${currentAd.sponsor}`)}
                className="px-2 py-0.5 bg-[#D4AF37] hover:bg-amber-400 text-[#1A3A3A] font-bold text-[10px] rounded-sm cursor-pointer transition-colors shadow-xs"
              >
                {currentAd.ctaText}
              </button>
            </div>
          </div>
        )}

        {/* PERIODIC SPLASH SCREEN AD OVERLAY */}
        <AnimatePresence>
          {showSplashAd && currentAd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#1A3A3A]/95 text-[#FDFBF7] p-6 flex flex-col justify-between items-center text-center"
            >
              <div className="w-full flex justify-between items-center text-xs text-[#D4AF37]">
                <span className="px-2.5 py-0.5 bg-[#132E2E] rounded-sm border border-[#D4AF37]/40 uppercase tracking-widest font-mono text-[10px]">
                  Venice Partner Ad
                </span>
                <button
                  onClick={() => setShowSplashAd(false)}
                  className="p-1.5 rounded-full bg-[#132E2E] text-[#FDFBF7] hover:bg-[#D4AF37] hover:text-[#1A3A3A] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-auto space-y-4 max-w-xs">
                <img
                  src={currentAd.imageUrl}
                  alt={currentAd.title}
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 object-cover rounded-sm mx-auto shadow-2xl border-2 border-[#D4AF37]"
                />
                <h3 className="text-xl font-bold font-serif italic text-[#D4AF37]">{currentAd.title}</h3>
                <p className="text-xs text-[#FDFBF7]/80 leading-relaxed">{currentAd.subtitle}</p>
                <p className="text-[11px] text-[#D4AF37] font-medium">Provided by {currentAd.sponsor}</p>

                <button
                  onClick={() => setShowSplashAd(false)}
                  className="w-full py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-[#1A3A3A] font-bold text-xs rounded-sm shadow-lg transition-colors cursor-pointer"
                >
                  {currentAd.ctaText} &rarr;
                </button>
              </div>

              <p className="text-[10px] text-[#FDFBF7]/50">
                You can dismiss this ad anytime. Upgrade to VIP Ad-Free pass in options.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE BOTTOM TAB BAR */}
        <div className="bg-[#1A3A3A] text-[#FDFBF7] border-t border-[#D4AF37]/30 p-2 flex items-center justify-around text-[10px] font-medium z-20">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-sm transition-colors ${
              activeTab === 'map' ? 'text-[#D4AF37] bg-[#132E2E] font-bold border-l-2 border-[#D4AF37]' : 'text-[#FDFBF7]/70 hover:text-[#FDFBF7]'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Live Map</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-sm transition-colors ${
              activeTab === 'gallery' ? 'text-[#D4AF37] bg-[#132E2E] font-bold border-l-2 border-[#D4AF37]' : 'text-[#FDFBF7]/70 hover:text-[#FDFBF7]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Collection Index</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-sm transition-colors ${
              activeTab === 'radar' ? 'text-[#D4AF37] bg-[#132E2E] font-bold border-l-2 border-[#D4AF37]' : 'text-[#FDFBF7]/70 hover:text-[#FDFBF7]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>GPS Radar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
