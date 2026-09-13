import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { HistoricalImage, UserLocation } from '../types';
import { ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface VeniceMapProps {
  images: HistoricalImage[];
  selectedImage: HistoricalImage | null;
  onSelectImage: (image: HistoricalImage, group?: HistoricalImage[]) => void;
  userLocation: UserLocation | null;
  onClusterSelect?: (clusterImages: HistoricalImage[]) => void;
}

// Venice 6 Historic Sestieri strict geographical bounds
const VENICE_BOUNDS: L.LatLngBoundsExpression = [
  [45.4200, 12.3000], // South-West (Giudecca / Dorsoduro edge)
  [45.4550, 12.3700]  // North-East (Cannaregio / Castello edge)
];

const VENICE_CENTER: L.LatLngExpression = [45.4355, 12.3365]; // Rialto / San Marco heart

export const VeniceMap: React.FC<VeniceMapProps> = ({
  images,
  selectedImage,
  onSelectImage,
  userLocation,
  onClusterSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [currentZoom, setCurrentZoom] = useState(15);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map with clean cartographic tiles without requiring an API key
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: VENICE_CENTER,
      zoom: 15,
      minZoom: 14,
      maxZoom: 19,
      maxBounds: VENICE_BOUNDS,
      maxBoundsViscosity: 0.95, // Graceful lock inside Venice historic sestieri
      zoomControl: false,
      attributionControl: false
    });

    // Esri World Topo Map: Free public cartographic basemap - NO API KEY REQUIRED
    // Uses maxNativeZoom: 18 so zooming in to level 19 smoothly scales the native level 18 tiles without ever failing or turning black
    const baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      minZoom: 14,
      maxZoom: 19,
      maxNativeZoom: 18,
      className: 'venice-map-tiles'
    });
    baseTileLayer.addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Spatial clustering calculation
  // Multiple images in the same location form a single bubble showing their count.
  // Clicking the bubble opens the image window to swipe through all of them.
  const clusteredItems = useMemo(() => {
    if (!images || images.length === 0) return [];

    // Geographic threshold scales with zoom level
    const clusterDistances: Record<number, number> = {
      14: 0.0035,
      15: 0.0020,
      16: 0.0010,
      17: 0.00045,
      18: 0.00022,
      19: 0.00010,
      20: 0.00005
    };
    const threshold = clusterDistances[currentZoom] || 0.00010;

    const clusters: Array<{
      type: 'cluster' | 'single';
      item?: HistoricalImage;
      items?: HistoricalImage[];
      lat: number;
      lng: number;
    }> = [];

    const assigned = new Set<string>();

    for (let i = 0; i < images.length; i++) {
      const imgA = images[i];
      if (assigned.has(imgA.id)) continue;

      const group = [imgA];
      let sumLat = imgA.lat;
      let sumLng = imgA.lng;

      for (let j = i + 1; j < images.length; j++) {
        const imgB = images[j];
        if (assigned.has(imgB.id)) continue;

        const dLat = Math.abs(imgA.lat - imgB.lat);
        const dLng = Math.abs(imgA.lng - imgB.lng);
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist <= threshold) {
          group.push(imgB);
          sumLat += imgB.lat;
          sumLng += imgB.lng;
          assigned.add(imgB.id);
        }
      }

      if (group.length > 1) {
        clusters.push({
          type: 'cluster',
          items: group,
          lat: sumLat / group.length,
          lng: sumLng / group.length
        });
      } else {
        clusters.push({
          type: 'single',
          item: imgA,
          lat: imgA.lat,
          lng: imgA.lng
        });
      }
      assigned.add(imgA.id);
    }

    return clusters;
  }, [images, currentZoom]);

  // Update map markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    clusteredItems.forEach((c) => {
      if (c.type === 'cluster' && c.items && c.items.length > 0) {
        // Venetian Crimson Cluster Badge showing the total count (e.g. 10, 13)
        const count = c.items.length;
        const containsSelected = selectedImage ? c.items.some(i => i.id === selectedImage.id) : false;
        
        const sizeClass = count > 20 
          ? 'w-11 h-11 text-sm' 
          : count > 8 
            ? 'w-9 h-9 text-xs' 
            : 'w-8 h-8 text-[11px]';

        const clusterHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 group" title="Click to view all ${count} images at this location">
            <div class="absolute -inset-1 bg-[#D4AF37]/50 rounded-full blur-[3px] ${containsSelected ? 'ring-2 ring-[#D4AF37]' : ''}"></div>
            <div class="${sizeClass} rounded-full bg-[#BA1B1D] border-2 border-[#D4AF37] text-white font-serif font-bold shadow-xl flex items-center justify-center tracking-tight z-10">
              ${count}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: clusterHtml,
          className: 'venice-cluster-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([c.lat, c.lng], { icon });
        marker.on('click', () => {
          // Center smoothly on clicked location
          if (mapInstanceRef.current) {
            const current = mapInstanceRef.current.getZoom();
            const targetZoom = Math.min(Math.max(current + 1, 16), 18);
            mapInstanceRef.current.flyTo([c.lat, c.lng], targetZoom, { duration: 0.5 });
          }

          // Directly bring up the Image Detail Window with all images at this location
          if (c.items && c.items.length > 0) {
            onSelectImage(c.items[0], c.items);
          }

          if (onClusterSelect && c.items) {
            onClusterSelect(c.items);
          }
        });

        marker.addTo(layer);
      } else if (c.type === 'single' && c.item) {
        // Individual Pin for single photos/paintings
        const item = c.item;
        const isSelected = selectedImage?.id === item.id;
        const isPainting = item.mediaType === 'painting' || item.category === 'painting';

        const pinHtml = `
          <div class="relative flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'}" title="${item.title} (${item.yearLabel || item.era})">
            ${isSelected ? '<div class="absolute -inset-1.5 bg-[#D4AF37] rounded-full blur-[4px] opacity-80 animate-pulse"></div>' : ''}
            <div class="relative w-8 h-8 rounded-full ${
              isPainting 
                ? 'bg-[#D4AF37] border-2 border-[#BA1B1D] text-[#BA1B1D] shadow-[0_2px_8px_rgba(212,175,55,0.7)]' 
                : 'bg-[#BA1B1D] border-2 border-[#D4AF37] text-[#FAF8F5] shadow-[0_2px_8px_rgba(186,27,29,0.7)]'
            } flex items-center justify-center z-10">
              ${isPainting ? `
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="13.5" cy="6.5" r=".7" fill="currentColor"/>
                  <circle cx="17.5" cy="10.5" r=".7" fill="currentColor"/>
                  <circle cx="8.5" cy="7.5" r=".7" fill="currentColor"/>
                  <circle cx="6.5" cy="12.5" r=".7" fill="currentColor"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                </svg>
              ` : `
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              `}
            </div>
            <!-- Pin Droplet Point -->
            <div class="w-2 h-2 -mt-1 rotate-45 ${isPainting ? 'bg-[#D4AF37]' : 'bg-[#BA1B1D]'} shadow-sm z-10"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: 'venice-pin-icon',
          iconSize: [32, 36],
          iconAnchor: [16, 36]
        });

        const marker = L.marker([c.lat, c.lng], { icon });
        marker.on('click', () => {
          onSelectImage(item, [item]);
        });

        marker.addTo(layer);
      }
    });
  }, [clusteredItems, selectedImage, mapReady, onSelectImage, onClusterSelect]);

  // Fly to selected image when changed externally
  useEffect(() => {
    if (!selectedImage || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedImage.lat, selectedImage.lng], Math.max(currentZoom, 17), {
      duration: 0.8
    });
  }, [selectedImage]);

  // User GPS Location Marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-[#3B82F6]/30 animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-lg"></div>
        </div>
      `;
      const icon = L.divIcon({
        html: userHtml,
        className: 'user-location-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(mapInstanceRef.current);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation, mapReady]);

  // Zoom Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 17);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(VENICE_CENTER, 15);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#D5E8EB]">
      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        id="venice-leaflet-map"
        className="w-full h-full z-0 select-none"
      />

      {/* Floating Map Navigation Controls */}
      <div className="absolute right-3.5 bottom-20 z-20 flex flex-col gap-2">
        <button
          id="btn-map-recenter"
          onClick={handleRecenter}
          className="w-10 h-10 rounded-xl bg-[#1A1A22]/90 border border-[#2E2E38] text-[#E5C158] hover:text-[#FAF8F5] hover:bg-[#262632] backdrop-blur-md shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Recenter Map"
        >
          <Compass className="w-5 h-5" />
        </button>

        <div className="flex flex-col rounded-xl overflow-hidden bg-[#1A1A22]/90 border border-[#2E2E38] backdrop-blur-md shadow-xl">
          <button
            id="btn-map-zoom-in"
            onClick={handleZoomIn}
            className="w-10 h-10 text-[#FAF8F5] hover:bg-[#262632] flex items-center justify-center transition-colors border-b border-[#2E2E38] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-map-zoom-out"
            onClick={handleZoomOut}
            className="w-10 h-10 text-[#FAF8F5] hover:bg-[#262632] flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
