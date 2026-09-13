export type Category = 'photograph' | 'painting' | 'map' | 'sketch';

export interface HistoricalImage {
  id: string;
  title: string;
  category: Category;
  mediaType?: 'photo' | 'painting';
  caption?: string;
  year: number;
  yearLabel: string;
  era: string;
  creator: string;
  description?: string;
  historicalContext?: string;
  district: string;
  sestiere?: string;
  lat: number;
  lng: number;
  imageUrl: string;
  imageFile?: string;
  previewFallbackUrl?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  rights?: string;
  tags: string[];
  inBounds?: boolean;
  coordinates?: { lat: number; lng: number };
  viewsCount?: number;
  featured?: boolean;
  createdAt?: string;
}

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  sponsor: string;
  targetUrl?: string;
  category?: string;
}

export interface VeniceDistrict {
  id: string;
  name: string;
  italianName: string;
  lat: number;
  lng: number;
  description: string;
  imageCount?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  isSimulated?: boolean;
}
