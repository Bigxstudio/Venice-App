import React from 'react';
import { HistoricalImage, VeniceDistrict } from '../types';
import { Database, Image as ImageIcon, MapPin, Calendar, Layers, BarChart3, TrendingUp, CheckCircle, Award } from 'lucide-react';

interface StatsDashboardProps {
  images: HistoricalImage[];
  districts: VeniceDistrict[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ images, districts }) => {
  const totalCount = images.length;

  // Breakdown by category
  const photoCount = images.filter(i => i.category === 'photograph').length;
  const paintingCount = images.filter(i => i.category === 'painting').length;
  const mapCount = images.filter(i => i.category === 'map').length;
  const sketchCount = images.filter(i => i.category === 'sketch').length;

  // District breakdown
  const districtCounts = districts.map(d => {
    const count = images.filter(i => i.district === d.italianName || i.district === d.name).length;
    return { name: d.italianName, englishName: d.name, count };
  });

  return (
    <div className="w-full h-full bg-[#FDFBF7] text-[#2D241E] p-4 md:p-6 overflow-y-auto space-y-6 font-sans">
      {/* Title */}
      <div className="pb-4 border-b border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-[#1A3A3A] text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
            Archive Analytics & Statistics
          </span>
          <h1 className="text-xl md:text-2xl font-bold font-serif italic text-[#1A3A3A] mt-1">
            Venice Historical Image Database Metrics
          </h1>
        </div>
        <div className="text-xs text-[#2D241E] font-serif italic bg-white px-3 py-1.5 rounded-sm border border-[#E5E0D8] shadow-sm">
          Capacity Target: 2,000 Historical Records
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-sm border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#1A3A3A] uppercase tracking-wider">Total Active Records</p>
            <h3 className="text-2xl font-bold font-serif italic text-[#1A3A3A] mt-1">{totalCount}</h3>
            <p className="text-[11px] text-[#2D241E]/70 mt-0.5 italic">Indexed with Geolocation</p>
          </div>
          <div className="p-3 bg-[#1A3A3A] text-[#D4AF37] rounded-sm border border-[#D4AF37]/30">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#1A3A3A] uppercase tracking-wider">Photographs & Prints</p>
            <h3 className="text-2xl font-bold font-serif italic text-[#1A3A3A] mt-1">{photoCount}</h3>
            <p className="text-[11px] text-[#2D241E]/70 mt-0.5 italic">19th & 20th Century Glass Plates</p>
          </div>
          <div className="p-3 bg-[#1A3A3A] text-[#D4AF37] rounded-sm border border-[#D4AF37]/30">
            <ImageIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#1A3A3A] uppercase tracking-wider">Fine Art & Vedute</p>
            <h3 className="text-2xl font-bold font-serif italic text-[#1A3A3A] mt-1">{paintingCount}</h3>
            <p className="text-[11px] text-[#2D241E]/70 mt-0.5 italic">Canaletto, Guardi, Bellini, Titian</p>
          </div>
          <div className="p-3 bg-[#1A3A3A] text-[#D4AF37] rounded-sm border border-[#D4AF37]/30">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-sm border border-[#E5E0D8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#1A3A3A] uppercase tracking-wider">Maps & Engravings</p>
            <h3 className="text-2xl font-bold font-serif italic text-[#1A3A3A] mt-1">{mapCount + sketchCount}</h3>
            <p className="text-[11px] text-[#2D241E]/70 mt-0.5 italic">Barbari, Coronelli & Sketches</p>
          </div>
          <div className="p-3 bg-[#1A3A3A] text-[#D4AF37] rounded-sm border border-[#D4AF37]/30">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* District Coverage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-sm border border-[#E5E0D8] space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#1A3A3A] font-serif italic flex items-center gap-2 pb-2 border-b border-[#E5E0D8]">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>District (Sestiere) Archive Distribution</span>
          </h3>

          <div className="space-y-3">
            {districtCounts.map((d, i) => {
              const pct = totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#1A3A3A] font-serif italic">{d.name} ({d.englishName})</span>
                    <span className="font-mono text-[#D4AF37] bg-[#1A3A3A] px-1.5 py-0.5 rounded-sm text-[10px] font-bold">{d.count} items ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#FDFBF7] rounded-none overflow-hidden border border-[#E5E0D8]">
                    <div
                      className="h-full bg-[#D4AF37]"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System & Architecture Highlights */}
        <div className="bg-white p-5 rounded-sm border border-[#E5E0D8] space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#1A3A3A] font-serif italic flex items-center gap-2 pb-2 border-b border-[#E5E0D8]">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>Venice Mobile Map Architecture</span>
          </h3>

          <div className="space-y-3 text-xs text-[#2D241E]">
            <div className="p-3 bg-[#FDFBF7] rounded-sm border border-[#E5E0D8] flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A3A3A] font-serif italic">Finite Embedded Map Layer:</strong>
                <p className="text-[#2D241E]/80 mt-0.5">
                  Restricted bounds centered precisely over the Venice Lagoon and historic islands. Does not depend on heavy third-party real-time navigation APIs.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FDFBF7] rounded-sm border border-[#E5E0D8] flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A3A3A] font-serif italic">Online Database & CMS Integration:</strong>
                <p className="text-[#2D241E]/80 mt-0.5">
                  Supports up to 2,000+ historical images stored online to keep mobile app memory light while allowing instant additions through the Admin CMS interface.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FDFBF7] rounded-sm border border-[#E5E0D8] flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1A3A3A] font-serif italic">Ad-Supported & Monetization Simulation:</strong>
                <p className="text-[#2D241E]/80 mt-0.5">
                  Simulates non-intrusive bottom banner graphics and optional splash ads for tourism partners (Gondolas, Vaporetto passes, Murano workshops).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
