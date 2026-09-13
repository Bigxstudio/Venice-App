import React, { useState } from 'react';
import { HistoricalImage, Category, VeniceDistrict } from '../types';
import { api } from '../services/api';
import { VeniceMap } from './VeniceMap';
import { Plus, Edit2, Trash2, Search, RotateCcw, Download, Upload, MapPin, Check, AlertCircle, Database, Image as ImageIcon, Sparkles, Filter } from 'lucide-react';

interface AdminCMSProps {
  images: HistoricalImage[];
  districts: VeniceDistrict[];
  onRefreshData: () => void;
  onSelectImagePreview: (image: HistoricalImage) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  images,
  districts,
  onRefreshData,
  onSelectImagePreview
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingImage, setEditingImage] = useState<HistoricalImage | null>(null);
  
  // Search & Filters for CMS list
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'photograph' as Category,
    year: 1900,
    yearLabel: 'c. 1900',
    era: '19th Century',
    creator: '',
    description: '',
    historicalContext: '',
    district: 'San Marco',
    lat: 45.4338,
    lng: 12.3387,
    imageUrl: '',
    tags: '',
    featured: false
  });

  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preset Image URLs for quick testing in CMS
  const PRESET_IMAGES = [
    { title: 'Grand Canal View', url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1000&q=80' },
    { title: 'St Mark Square', url: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=1000&q=80' },
    { title: 'Gondola Canal', url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1000&q=80' },
    { title: 'Historic Street', url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80' },
    { title: 'Venetian Palace', url: 'https://images.unsplash.com/photo-1548685913-fe6678babe8d?auto=format&fit=crop&w=1000&q=80' }
  ];

  const handlePickLocation = (coords: { lat: number; lng: number }) => {
    setPickedCoords(coords);
    setFormData(prev => ({
      ...prev,
      lat: Number(coords.lat.toFixed(6)),
      lng: Number(coords.lng.toFixed(6))
    }));
    setStatusMessage({
      type: 'success',
      text: `Coordinates selected from Venice map: Lat ${coords.lat.toFixed(5)}, Lng ${coords.lng.toFixed(5)}`
    });
  };

  const handleStartAdd = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      category: 'photograph',
      year: 1890,
      yearLabel: 'c. 1890',
      era: '19th Century',
      creator: 'Venetian Photo Studio',
      description: '',
      historicalContext: '',
      district: 'San Marco',
      lat: 45.4338,
      lng: 12.3387,
      imageUrl: PRESET_IMAGES[0].url,
      tags: 'Venice, History, Historic Photo',
      featured: false
    });
    setPickedCoords(null);
    setActiveTab('add');
    setStatusMessage(null);
  };

  const handleStartEdit = (img: HistoricalImage) => {
    setEditingImage(img);
    setFormData({
      title: img.title,
      category: img.category,
      year: img.year,
      yearLabel: img.yearLabel,
      era: img.era,
      creator: img.creator,
      description: img.description,
      historicalContext: img.historicalContext,
      district: img.district,
      lat: img.lat,
      lng: img.lng,
      imageUrl: img.imageUrl,
      tags: img.tags.join(', '),
      featured: Boolean(img.featured)
    });
    setPickedCoords({ lat: img.lat, lng: img.lng });
    setActiveTab('edit');
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      setStatusMessage({ type: 'error', text: 'Please fill in required fields (Title & Image URL).' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const tagArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      if (editingImage) {
        // Update existing
        await api.updateImage(editingImage.id, {
          title: formData.title,
          category: formData.category,
          year: Number(formData.year),
          yearLabel: formData.yearLabel,
          era: formData.era,
          creator: formData.creator,
          description: formData.description,
          historicalContext: formData.historicalContext,
          district: formData.district,
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          imageUrl: formData.imageUrl,
          tags: tagArray,
          featured: formData.featured
        });
        setStatusMessage({ type: 'success', text: `Successfully updated record "${formData.title}"` });
      } else {
        // Create new
        await api.createImage({
          title: formData.title,
          category: formData.category,
          year: Number(formData.year),
          yearLabel: formData.yearLabel,
          era: formData.era,
          creator: formData.creator,
          description: formData.description,
          historicalContext: formData.historicalContext,
          district: formData.district,
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          imageUrl: formData.imageUrl,
          tags: tagArray,
          featured: formData.featured
        });
        setStatusMessage({ type: 'success', text: `Successfully created new record "${formData.title}" in Venice Database!` });
      }

      onRefreshData();
      setTimeout(() => {
        setActiveTab('list');
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save record' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the Venice archive?`)) return;

    try {
      await api.deleteImage(id);
      setStatusMessage({ type: 'success', text: `Deleted record "${title}"` });
      onRefreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to delete record' });
    }
  };

  const handleResetSeed = async () => {
    if (!confirm('Reset database to original ~35 historical Venice records? Custom entries will be replaced with baseline dataset.')) return;
    try {
      await api.resetDatabase();
      setStatusMessage({ type: 'success', text: 'Database reset to default dataset successfully.' });
      onRefreshData();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to reset database.' });
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(images, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `venice_historical_database_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered List
  const filteredImages = images.filter(img => {
    const matchesSearch = searchQuery === '' || 
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter;
    const matchesDistrict = districtFilter === 'all' || img.district === districtFilter;
    return matchesSearch && matchesCategory && matchesDistrict;
  });

  return (
    <div className="w-full h-full bg-[#FDFBF7] text-[#2D241E] flex flex-col overflow-y-auto p-4 md:p-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-[#1A3A3A] text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
              Backend Interface
            </span>
            <span className="text-xs text-[#2D241E]/70 font-serif italic">Live Database CMS &bull; {images.length} Records</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-serif italic text-[#1A3A3A] mt-1">
            Venice Historical Online Archive Management
          </h1>
        </div>

        {/* CMS Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartAdd}
            className="px-3.5 py-2 bg-[#D4AF37] hover:bg-amber-400 text-[#1A3A3A] font-bold text-xs rounded-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Image Record</span>
          </button>

          <button
            onClick={handleResetSeed}
            className="px-3 py-2 bg-[#1A3A3A] hover:bg-[#132E2E] text-[#FDFBF7] font-medium text-xs rounded-sm border border-[#D4AF37]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset Database to Default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Reset Baseline Data</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-[#1A3A3A] hover:bg-[#132E2E] text-[#FDFBF7] font-medium text-xs rounded-sm border border-[#D4AF37]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export JSON Database Backup"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div className={`mt-4 p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40' : 'bg-rose-950/60 text-rose-200 border-rose-500/40'
        }`}>
          {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-[#E5E0D8]">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'list'
              ? 'border-[#D4AF37] text-[#1A3A3A] bg-white font-bold'
              : 'border-transparent text-[#2D241E]/70 hover:text-[#1A3A3A]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Database Inventory ({filteredImages.length})</span>
        </button>

        <button
          onClick={handleStartAdd}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'add' || activeTab === 'edit'
              ? 'border-[#D4AF37] text-[#1A3A3A] bg-white font-bold'
              : 'border-transparent text-[#2D241E]/70 hover:text-[#1A3A3A]'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{editingImage ? 'Edit Image' : 'Add New Record'}</span>
        </button>
      </div>

      {/* TAB 1: LIST / TABLE VIEW */}
      {activeTab === 'list' && (
        <div className="mt-4 flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-sm border border-[#E5E0D8]">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search title, artist, district..."
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] text-xs rounded-sm pl-9 pr-3 py-2 text-[#2D241E] placeholder-[#2D241E]/50 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#FDFBF7] border border-[#E5E0D8] text-xs rounded-sm px-3 py-2 text-[#1A3A3A] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Categories</option>
              <option value="photograph">Photographs</option>
              <option value="painting">Paintings</option>
              <option value="map">Maps & Engravings</option>
              <option value="sketch">Sketches</option>
            </select>

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="bg-[#FDFBF7] border border-[#E5E0D8] text-xs rounded-sm px-3 py-2 text-[#1A3A3A] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Venice Districts</option>
              {districts.map(d => (
                <option key={d.id} value={d.italianName}>{d.italianName} ({d.name})</option>
              ))}
            </select>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-sm border border-[#E5E0D8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A3A3A] text-[#D4AF37] font-serif font-bold border-b border-[#D4AF37]/30 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Thumbnail</th>
                    <th className="p-3">Title & Creator</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Year / Era</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Coordinates</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {filteredImages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#2D241E]/60 italic font-serif">
                        No records found matching current query or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredImages.map(img => (
                      <tr key={img.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="p-3">
                          <img
                            src={img.imageUrl}
                            alt={img.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-10 object-cover rounded-sm border border-[#E5E0D8] cursor-pointer"
                            onClick={() => onSelectImagePreview(img)}
                          />
                        </td>
                        <td className="p-3">
                          <p className="font-bold font-serif text-[#1A3A3A] line-clamp-1">{img.title}</p>
                          <p className="text-[11px] text-[#2D241E]/70 italic">{img.creator}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm bg-[#1A3A3A] text-[#D4AF37] border border-[#D4AF37]/30">
                            {img.category}
                          </span>
                        </td>
                        <td className="p-3 text-[#1A3A3A] font-medium font-serif italic">
                          {img.yearLabel}
                        </td>
                        <td className="p-3 text-[#2D241E]">
                          {img.district}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#2D241E]/70">
                          {img.lat.toFixed(4)}, {img.lng.toFixed(4)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(img)}
                              className="p-1.5 text-[#1A3A3A] hover:bg-[#D4AF37]/20 rounded-sm border border-[#E5E0D8] transition-colors cursor-pointer"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(img.id, img.title)}
                              className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-sm border border-rose-200 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: ADD / EDIT FORM WITH INTERACTIVE MAP PICKER */}
      {(activeTab === 'add' || activeTab === 'edit') && (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
          {/* Left Column: Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-sm border border-[#E5E0D8] space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-[#1A3A3A] font-serif italic flex items-center gap-2 pb-2 border-b border-[#E5E0D8]">
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
              <span>{editingImage ? `Edit Record: ${editingImage.id}` : 'New Historical Entry Metadata'}</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Entrance to the Grand Canal, Venice"
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Category & District Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#1A3A3A] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="photograph">Photograph</option>
                  <option value="painting">Painting</option>
                  <option value="map">Map & Engraving</option>
                  <option value="sketch">Sketch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">District (Sestiere) *</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#1A3A3A] focus:outline-none focus:border-[#D4AF37]"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.italianName}>{d.italianName} ({d.name})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Creator & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Year (Numeric)</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Year Label</label>
                <input
                  type="text"
                  value={formData.yearLabel}
                  onChange={e => setFormData({ ...formData, yearLabel: e.target.value })}
                  placeholder="e.g. c. 1730"
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Era</label>
                <input
                  type="text"
                  value={formData.era}
                  onChange={e => setFormData({ ...formData, era: e.target.value })}
                  placeholder="e.g. 18th Century"
                  className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Creator / Artist / Photographer */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Artist / Photographer / Creator</label>
              <input
                type="text"
                value={formData.creator}
                onChange={e => setFormData({ ...formData, creator: e.target.value })}
                placeholder="e.g. Giovanni Antonio Canal (Canaletto)"
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Image URL & Preset Pickers */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Image URL *</label>
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37] font-mono"
              />
              {/* Preset suggestion chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#2D241E]/60 font-medium">Quick Preset Images:</span>
                {PRESET_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                    className="px-2 py-0.5 bg-[#FDFBF7] hover:bg-[#1A3A3A] hover:text-[#D4AF37] text-[#2D241E] text-[10px] rounded-sm border border-[#E5E0D8] transition-colors cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates Lat & Lng */}
            <div className="grid grid-cols-2 gap-3 bg-[#FDFBF7] p-3 rounded-sm border border-[#E5E0D8]">
              <div>
                <label className="block text-[11px] font-mono text-[#1A3A3A] font-bold mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={e => setFormData({ ...formData, lat: Number(e.target.value) })}
                  className="w-full bg-white border border-[#E5E0D8] rounded-sm px-2.5 py-1.5 text-xs text-[#2D241E] font-mono focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#1A3A3A] font-bold mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={e => setFormData({ ...formData, lng: Number(e.target.value) })}
                  className="w-full bg-white border border-[#E5E0D8] rounded-sm px-2.5 py-1.5 text-xs text-[#2D241E] font-mono focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Overview & Context */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Historical Overview</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of the historical scene..."
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm p-2.5 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Detailed Historical Context</label>
              <textarea
                rows={3}
                value={formData.historicalContext}
                onChange={e => setFormData({ ...formData, historicalContext: e.target.value })}
                placeholder="Architectural, cultural, or social history notes..."
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm p-2.5 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-[#1A3A3A] mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                placeholder="San Marco, Canaletto, 18th Century"
                className="w-full bg-[#FDFBF7] border border-[#E5E0D8] rounded-sm px-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 bg-white hover:bg-[#FDFBF7] text-[#2D241E] border border-[#E5E0D8] text-xs font-medium rounded-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#1A3A3A] hover:bg-[#132E2E] text-[#D4AF37] text-xs font-bold rounded-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-[#D4AF37]/30"
              >
                <Check className="w-4 h-4 text-[#D4AF37]" />
                <span>{isSubmitting ? 'Saving to Database...' : (editingImage ? 'Update Record' : 'Save New Entry')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Venice Location Picker Map (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-sm border border-[#E5E0D8] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E0D8]">
                <h3 className="text-sm font-bold text-[#1A3A3A] font-serif italic flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>Interactive Map Location Picker</span>
                </h3>
                <span className="text-[10px] font-mono text-[#D4AF37] bg-[#1A3A3A] px-2 py-0.5 rounded-sm border border-[#D4AF37]/30">
                  Click to drop pin
                </span>
              </div>
              <p className="text-xs text-[#2D241E]/70 mb-3">
                Click anywhere on the Venice map below to automatically fill the exact GPS coordinates for this image entry.
              </p>

              {/* Map Container */}
              <div className="h-72 w-full rounded-sm overflow-hidden border border-[#E5E0D8] shadow-inner">
                <VeniceMap
                  images={images}
                  selectedImage={null}
                  onSelectImage={() => {}}
                  userLocation={null}
                  isPickerMode={true}
                  pickedCoords={pickedCoords || { lat: formData.lat, lng: formData.lng }}
                  onPickLocation={handlePickLocation}
                />
              </div>
            </div>

            {/* Image Preview Box */}
            <div className="mt-4 p-3 bg-[#FDFBF7] rounded-sm border border-[#E5E0D8]">
              <p className="text-[11px] font-semibold text-[#1A3A3A] uppercase tracking-wider mb-2 font-serif">Live Image Preview</p>
              {formData.imageUrl ? (
                <div className="relative h-36 w-full bg-[#1A3A3A] rounded-sm overflow-hidden border border-[#E5E0D8]">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#1A3A3A]/90 backdrop-blur-md px-2 py-1 rounded-sm text-[10px] text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                    {formData.district} &bull; {formData.category}
                  </div>
                </div>
              ) : (
                <div className="h-32 w-full bg-[#1A3A3A] rounded-sm flex items-center justify-center text-[#FDFBF7]/60 text-xs italic font-serif">
                  Enter an image URL to preview
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
