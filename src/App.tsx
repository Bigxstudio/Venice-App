import React, { useEffect, useState, useMemo } from 'react';
import { HistoricalImage, UserLocation } from './types';
import { api } from './services/api';
import { VENICE_ARCHIVE_RECORDS } from './data/veniceArchive';
import { VeniceMap } from './components/VeniceMap';
import { ImageDetailModal } from './components/ImageDetailModal';
import { SplashIntro } from './components/SplashIntro';
import { LocationPrimerModal } from './components/LocationPrimerModal';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { AdBannerSlot } from './components/AdBannerSlot';
import { VenetianFlag } from './components/VenetianFlag';
import {
  Search,
  Layers,
  MapPin,
  Compass,
  Navigation,
  BookOpen,
  Info,
  ShieldCheck,
  Lock,
  Filter,
  X
} from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<HistoricalImage[]>(VENICE_ARCHIVE_RECORDS);
  const [selectedImage, setSelectedImage] = useState<HistoricalImage | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<HistoricalImage[] | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const handleSelectImage = (img: HistoricalImage, group?: HistoricalImage[]) => {
    setSelectedImage(img);
    setSelectedGroup(group && group.length > 0 ? group : [img]);
  };

  // Filter States
  const [mediaFilter, setMediaFilter] = useState<'all' | 'painting' | 'photo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Overlay states
  const [showSplash, setShowSplash] = useState(true);
  const [showLocationPrimer, setShowLocationPrimer] = useState(false);
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [clusterImages, setClusterImages] = useState<HistoricalImage[] | null>(null);

  // Load backend API images if available, fallback to local offline dataset
  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await api.getImages();
        if (res && res.images && res.images.length > 0) {
          setImages(res.images);
        }
      } catch (err) {
        console.warn('Using local offline Venice Archive records:', err);
        setImages(VENICE_ARCHIVE_RECORDS);
      }
    };
    loadImages();
  }, []);

  // Request browser GPS location
  const handleRequestLocation = () => {
    setShowLocationPrimer(false);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        console.warn('User denied or failed GPS location:', err.message);
        // Fallback: center of Venice
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter images based on media type and search query
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (mediaFilter !== 'all') {
        const isPainting = img.mediaType === 'painting' || img.category === 'painting';
        if (mediaFilter === 'painting' && !isPainting) return false;
        if (mediaFilter === 'photo' && isPainting) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = img.title.toLowerCase().includes(q);
        const matchesCreator = img.creator.toLowerCase().includes(q);
        const matchesCaption = (img.caption || '').toLowerCase().includes(q);
        const matchesDistrict = (img.sestiere || img.district || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCreator && !matchesCaption && !matchesDistrict) return false;
      }
      return true;
    });
  }, [images, mediaFilter, searchQuery]);

  // Counts for pills
  const counts = useMemo(() => {
    let paintings = 0;
    let photos = 0;
    images.forEach((img) => {
      if (img.mediaType === 'painting' || img.category === 'painting') {
        paintings++;
      } else {
        photos++;
      }
    });
    return { all: images.length, paintings, photos };
  }, [images]);

  // Search auto-suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return images
      .filter((img) => {
        return (
          img.title.toLowerCase().includes(q) ||
          img.creator.toLowerCase().includes(q) ||
          (img.sestiere || img.district || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 5);
  }, [images, searchQuery]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#121216] text-[#FAF8F5] overflow-hidden select-none font-sans">
      {/* 1. ELEGANT VENETIAN SPLASH SCREEN */}
      {showSplash && <SplashIntro onDismiss={() => setShowSplash(false)} />}

      {/* 2. LOCATION PERMISSION PRIMER */}
      <LocationPrimerModal
        isOpen={showLocationPrimer}
        onAllow={handleRequestLocation}
        onDismiss={() => setShowLocationPrimer(false)}
      />

      {/* 3. ARCHIVE COLLECTION INDEX DRAWER */}
      <ArchiveDrawer
        isOpen={showArchiveDrawer}
        onClose={() => setShowArchiveDrawer(false)}
        images={images}
        onSelectImage={(img) => {
          setSelectedImage(img);
          setShowArchiveDrawer(false);
        }}
      />

      {/* 4. TOP FLOATING CONTROL BAR */}
      <header className="absolute top-0 left-0 right-0 z-30 p-3 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto w-full">
          {/* Brand Emblem (Lion of Saint Mark Flag Icon) & Title */}
          <div className="flex items-center gap-2.5 pointer-events-auto bg-[#181820]/90 backdrop-blur-md border border-[#2E2E3A] px-3 py-1.5 rounded-full shadow-lg">
            <div 
              id="brand-flag-icon"
              onClick={() => setShowAboutModal(true)}
              title="Serene Republic of Venice - Lion of Saint Mark Emblem (Click for archive details)"
              className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/80 ring-1 ring-black/40 shadow-sm flex-shrink-0 bg-[#0F1416] cursor-pointer hover:border-[#D4AF37] transition-all group"
            >
              <img
                src="/images/flag_icon.svg"
                alt="Republic of Venice Flag Emblem"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xs font-serif font-bold text-[#FAF8F5] leading-tight">
                Venice Echoes
              </h1>
              <p className="text-[9px] text-[#D4AF37] tracking-wider uppercase font-medium">
                Historic Image Map
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* GPS Locate Button */}
            <button
              id="btn-trigger-gps"
              onClick={() => {
                if (!userLocation) {
                  setShowLocationPrimer(true);
                } else {
                  handleRequestLocation();
                }
              }}
              className="w-8 h-8 rounded-full bg-[#181820]/90 hover:bg-[#242430] border border-[#2E2E3A] backdrop-blur-md text-[#FAF8F5] flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              title="Locate my position"
            >
              <Navigation className={`w-4 h-4 ${userLocation ? 'text-[#3B82F6]' : 'text-[#A6A49E]'}`} />
            </button>

            {/* Archive Drawer Button */}
            <button
              id="btn-open-archive"
              onClick={() => setShowArchiveDrawer(true)}
              className="px-3 py-1.5 rounded-full bg-[#181820]/90 hover:bg-[#242430] border border-[#2E2E3A] backdrop-blur-md text-xs font-medium text-[#FAF8F5] flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Image Index</span>
              <span className="text-[10px] text-[#A6A49E] font-mono">({images.length})</span>
            </button>

            {/* About / Rights Modal */}
            <button
              id="btn-open-about"
              onClick={() => setShowAboutModal(true)}
              className="w-8 h-8 rounded-full bg-[#181820]/90 hover:bg-[#242430] border border-[#2E2E3A] backdrop-blur-md text-[#FAF8F5] flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              title="Archive Rights & Info"
            >
              <Info className="w-4 h-4 text-[#A6A49E]" />
            </button>
          </div>
        </div>

        {/* Media Filter Pill & Search Bar */}
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto w-full pointer-events-auto">
          {/* Segmented Media Filter */}
          <div className="flex items-center p-0.5 rounded-full bg-[#181820]/90 backdrop-blur-md border border-[#2E2E3A] shadow-lg text-xs">
            <button
              id="filter-pill-all"
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                mediaFilter === 'all'
                  ? 'bg-[#BA1B1D] text-white font-semibold shadow-xs'
                  : 'text-[#A6A49E] hover:text-[#FAF8F5]'
              }`}
            >
              All <span className="text-[10px] opacity-75 font-mono">{counts.all}</span>
            </button>
            <button
              id="filter-pill-paintings"
              onClick={() => setMediaFilter('painting')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                mediaFilter === 'painting'
                  ? 'bg-[#BA1B1D] text-white font-semibold shadow-xs'
                  : 'text-[#A6A49E] hover:text-[#FAF8F5]'
              }`}
            >
              <span>🎨 Paintings</span>
              <span className="text-[10px] opacity-75 font-mono">{counts.paintings}</span>
            </button>
            <button
              id="filter-pill-photos"
              onClick={() => setMediaFilter('photo')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                mediaFilter === 'photo'
                  ? 'bg-[#BA1B1D] text-white font-semibold shadow-xs'
                  : 'text-[#A6A49E] hover:text-[#FAF8F5]'
              }`}
            >
              <span>📷 Photos</span>
              <span className="text-[10px] opacity-75 font-mono">{counts.photos}</span>
            </button>
          </div>

          {/* Quick Search Toggle / Input */}
          <div className="relative">
            <div className="flex items-center bg-[#181820]/90 backdrop-blur-md border border-[#2E2E3A] rounded-full px-2.5 py-1 shadow-lg">
              <Search className="w-3.5 h-3.5 text-[#A6A49E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  document.documentElement.scrollLeft = 0;
                  document.body.scrollLeft = 0;
                }}
                placeholder="Search..."
                className="w-24 sm:w-28 pl-1.5 pr-1 text-base sm:text-xs text-[#FAF8F5] bg-transparent focus:outline-none placeholder-[#7A7872]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#A6A49E] hover:text-[#FAF8F5] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Quick Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-[#181820] border border-[#2E2E3A] rounded-xl shadow-2xl p-1.5 space-y-1 z-40">
                <div className="px-2 py-1 text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider">
                  Matching Locations
                </div>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedImage(item);
                      setSearchQuery('');
                    }}
                    className="p-1.5 rounded-lg hover:bg-[#242430] cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-serif font-bold text-[#FAF8F5] truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-[#A6A49E] truncate">
                        {item.creator} • {item.sestiere || item.district}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 5. PRIMARY INTERACTIVE MAP CANVAS */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        <VeniceMap
          images={filteredImages}
          selectedImage={selectedImage}
          onSelectImage={handleSelectImage}
          userLocation={userLocation}
          onClusterSelect={(cImages) => {
            if (cImages && cImages.length > 0) {
              setClusterImages(cImages);
            }
          }}
        />

        {/* Cluster Image Carousel Drawer when a cluster is clicked */}
        {clusterImages && clusterImages.length > 0 && (
          <div className="absolute bottom-20 left-3 right-3 z-30 max-w-lg mx-auto bg-[#181820]/95 border border-[#2E2E3A] backdrop-blur-md rounded-2xl p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#E5C158] font-serif">
                {clusterImages.length} Historic Views at this Location
              </span>
              <button
                onClick={() => setClusterImages(null)}
                className="text-[#A6A49E] hover:text-[#FAF8F5] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {clusterImages.map((cImg) => (
                <div
                  key={cImg.id}
                  onClick={() => {
                    handleSelectImage(cImg, clusterImages);
                    setClusterImages(null);
                  }}
                  className="w-32 shrink-0 bg-[#121216] border border-[#2E2E38] rounded-xl p-1.5 cursor-pointer hover:border-[#D4AF37] transition-all"
                >
                  <div className="w-full h-20 rounded-lg bg-black/40 overflow-hidden mb-1.5">
                    <img
                      src={cImg.previewFallbackUrl || 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=300&q=80'}
                      alt={cImg.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h5 className="text-[11px] font-serif font-bold text-[#FAF8F5] truncate">
                    {cImg.title}
                  </h5>
                  <p className="text-[10px] text-[#A6A49E] truncate">
                    {cImg.creator}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 6. BOTTOM DETAIL MODAL / SHEET WITH MULTI-IMAGE SWIPE */}
      <ImageDetailModal
        image={selectedImage}
        images={selectedGroup}
        onSelectImage={(img) => setSelectedImage(img)}
        onClose={() => {
          setSelectedImage(null);
          setSelectedGroup(null);
        }}
        onLocateOnMap={(img) => {
          setSelectedImage(img);
        }}
      />

      {/* 7. STANDARD MOBILE AD BANNER (320x50 AdMob Placement) */}
      <AdBannerSlot districtName={selectedImage?.sestiere || 'San Marco'} />

      {/* 8. ABOUT & RIGHTS SAFE HARBOR MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#181820] border border-[#2E2E3A] rounded-2xl p-6 text-[#FAF8F5] shadow-2xl relative">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#A6A49E] hover:text-[#FAF8F5] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <VenetianFlag size="sm" className="drop-shadow-sm shrink-0" />
              <div>
                <h3 className="text-base font-serif font-bold text-[#FAF8F5]">Venice Echoes</h3>
                <p className="text-xs text-[#D4AF37]">Historic Image Map</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#C5C3BE] leading-relaxed mb-6 max-h-[60vh] overflow-y-auto pr-1">
              <p>
                This interactive archive features historic paintings and vintage photographs of Venice dating between 1730 and 1920.
              </p>

              {/* Startup Screen Visual Preview */}
              <div className="p-3 rounded-lg bg-[#121216] border border-[#262630] space-y-2">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setShowAboutModal(false);
                      setShowSplash(true);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#262630] hover:bg-[#BA1B1D] text-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Replay Splash
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden border border-[#2E2E3A] shadow-md">
                  <img
                    src="/images/startup_screen_preview.jpg"
                    alt="Venice Echoes Startup Screen Preview"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-[#121216] border border-[#262630] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Public Domain Status</span>
                </div>
                <p className="text-[11px] text-[#A6A49E] leading-relaxed">
                  All works presented were created over 100 years ago and reside in the worldwide public domain. Attributions are credited from archival records (Turner, Monet, Canaletto, Naya, Alinari, Ongania, Filippi, etc.).
                </p>
              </div>

              {/* Privacy Statement */}
              <div className="p-3 rounded-lg bg-[#121216] border border-[#262630] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#38BDF8] font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Privacy Notice</span>
                </div>
                <p className="text-[11px] text-[#A6A49E] leading-relaxed">
                  Venice Echoes does not collect, track, or share any personally identifiable information. Device location is used solely in real-time within your browser to center the map on your position and is never saved, uploaded, or transmitted to any server.
                </p>
              </div>

              <p className="text-[11px] text-[#8C8A84]">
                Inquiries, corrections, or rights questions may be addressed to: <span className="text-[#E5C158] font-mono">scottmarx@mac.com</span>
              </p>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#BA1B1D] hover:bg-[#9E1B1E] text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            >
              Return to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
