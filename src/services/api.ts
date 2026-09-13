import { HistoricalImage, Category, VeniceDistrict, AdBanner } from '../types';

export interface FetchImagesParams {
  category?: string;
  district?: string;
  search?: string;
  era?: string;
  featured?: boolean;
}

export const api = {
  async getImages(params: FetchImagesParams = {}): Promise<{ total: number; images: HistoricalImage[] }> {
    try {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.district) query.append('district', params.district);
      if (params.search) query.append('search', params.search);
      if (params.era) query.append('era', params.era);
      if (params.featured) query.append('featured', 'true');

      const res = await fetch(`/api/images?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      return await res.json();
    } catch (err) {
      console.warn('API connection failed, falling back to local fallback:', err);
      // Fallback
      const { INITIAL_IMAGES } = await import('../data/initialImages');
      let filtered = [...INITIAL_IMAGES];
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter(i => i.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.title.toLowerCase().includes(q) || 
          i.creator.toLowerCase().includes(q) || 
          i.description.toLowerCase().includes(q)
        );
      }
      return { total: filtered.length, images: filtered };
    }
  },

  async getImageById(id: string): Promise<HistoricalImage> {
    const res = await fetch(`/api/images/${id}`);
    if (!res.ok) throw new Error('Failed to fetch image details');
    return await res.json();
  },

  async createImage(imageData: Omit<HistoricalImage, 'id'>): Promise<{ message: string; image: HistoricalImage }> {
    const res = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create historical image record');
    }
    return await res.json();
  },

  async updateImage(id: string, imageData: Partial<HistoricalImage>): Promise<{ message: string; image: HistoricalImage }> {
    const res = await fetch(`/api/images/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageData)
    });
    if (!res.ok) throw new Error('Failed to update historical image record');
    return await res.json();
  },

  async deleteImage(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete image record');
    return await res.json();
  },

  async resetDatabase(): Promise<{ message: string; count: number }> {
    const res = await fetch('/api/images/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
    return await res.json();
  },

  async getStats(): Promise<{
    totalImages: number;
    categories: Record<string, number>;
    districts: Record<string, number>;
    eras: Record<string, number>;
  }> {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch {
      const { INITIAL_IMAGES } = await import('../data/initialImages');
      return {
        totalImages: INITIAL_IMAGES.length,
        categories: { photograph: 12, painting: 10, map: 3, sketch: 2 },
        districts: { 'San Marco': 10, 'San Polo': 5, 'Dorsoduro': 5, 'Cannaregio': 3 },
        eras: { '18th Century': 6, '19th Century': 10, 'Early 20th Century': 8 }
      };
    }
  },

  async getDistricts(): Promise<VeniceDistrict[]> {
    try {
      const res = await fetch('/api/districts');
      if (!res.ok) throw new Error('Failed to fetch districts');
      return await res.json();
    } catch {
      const { VENICE_DISTRICTS } = await import('../data/initialImages');
      return VENICE_DISTRICTS;
    }
  },

  async getAds(): Promise<AdBanner[]> {
    try {
      const res = await fetch('/api/ads');
      if (!res.ok) throw new Error('Failed to fetch ads');
      return await res.json();
    } catch {
      const { DEMO_ADS } = await import('../data/initialImages');
      return DEMO_ADS;
    }
  }
};
