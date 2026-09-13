import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_IMAGES, VENICE_DISTRICTS, DEMO_ADS } from './src/data/initialImages';
import { HistoricalImage, Category } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File path for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'venice_archive.json');
const LEGACY_DATA_FILE = path.join(DATA_DIR, 'venice_images.json');

// Memory store initialized from disk or default dataset
let imageDatabase: HistoricalImage[] = [];

function loadData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      imageDatabase = JSON.parse(raw);
      console.log(`Loaded ${imageDatabase.length} Venice historical records from venice_archive.json.`);
    } else if (fs.existsSync(LEGACY_DATA_FILE)) {
      const raw = fs.readFileSync(LEGACY_DATA_FILE, 'utf-8');
      imageDatabase = JSON.parse(raw);
      console.log(`Loaded ${imageDatabase.length} Venice records from legacy data file.`);
    } else {
      imageDatabase = [...INITIAL_IMAGES];
      saveData();
      console.log(`Initialized database with ${imageDatabase.length} seed Venice records.`);
    }
  } catch (err) {
    console.error('Error loading data from disk, falling back to initial dataset:', err);
    imageDatabase = [...INITIAL_IMAGES];
  }
}

function saveData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(imageDatabase, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data to disk:', err);
  }
}

// Load data immediately on startup
loadData();

// API ROUTES

// 1. GET /api/images
app.get('/api/images', (req, res) => {
  const { category, district, search, era, featured } = req.query;

  let results = [...imageDatabase];

  if (category && category !== 'all') {
    results = results.filter(img => img.category === category);
  }

  if (district && district !== 'all') {
    results = results.filter(img => img.district === district || img.district.toLowerCase() === (district as string).toLowerCase());
  }

  if (featured === 'true') {
    results = results.filter(img => img.featured);
  }

  if (era && era !== 'all') {
    results = results.filter(img => img.era === era);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    results = results.filter(img => 
      img.title.toLowerCase().includes(q) ||
      img.creator.toLowerCase().includes(q) ||
      img.description.toLowerCase().includes(q) ||
      img.historicalContext.toLowerCase().includes(q) ||
      img.district.toLowerCase().includes(q) ||
      img.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  res.json({
    total: results.length,
    images: results
  });
});

// 2. GET /api/images/:id
app.get('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const image = imageDatabase.find(img => img.id === id);

  if (!image) {
    res.status(404).json({ error: 'Historical image record not found' });
    return;
  }

  // Increment view count
  image.viewsCount = (image.viewsCount || 0) + 1;
  saveData();

  res.json(image);
});

// 3. POST /api/images (Backend CMS route to add new image)
app.post('/api/images', (req, res) => {
  const {
    title,
    category,
    year,
    yearLabel,
    era,
    creator,
    description,
    historicalContext,
    district,
    lat,
    lng,
    imageUrl,
    tags,
    featured
  } = req.body;

  if (!title || !category || lat === undefined || lng === undefined || !imageUrl) {
    res.status(400).json({ error: 'Missing required fields: title, category, lat, lng, imageUrl' });
    return;
  }

  const numYear = Number(year) || 1900;
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  const newId = `ven-${Date.now().toString().slice(-6)}`;
  const newImage: HistoricalImage = {
    id: newId,
    title,
    category: category as Category,
    year: numYear,
    yearLabel: yearLabel || `c. ${numYear}`,
    era: era || `${Math.floor(numYear / 100) + 1}th Century`,
    creator: creator || 'Unknown Artist / Photographer',
    description: description || 'No description provided.',
    historicalContext: historicalContext || 'Historical context to be documented.',
    district: district || 'San Marco',
    lat: parsedLat,
    lng: parsedLng,
    imageUrl,
    tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : ['Venice']),
    featured: Boolean(featured),
    viewsCount: 1,
    createdAt: new Date().toISOString()
  };

  imageDatabase.unshift(newImage);
  saveData();

  res.status(201).json({
    message: 'Historical image added successfully',
    image: newImage
  });
});

// 4. PUT /api/images/:id
app.put('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const index = imageDatabase.findIndex(img => img.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Historical image record not found' });
    return;
  }

  const existing = imageDatabase[index];
  const updated: HistoricalImage = {
    ...existing,
    ...req.body,
    id, // Keep same ID
    lat: req.body.lat !== undefined ? Number(req.body.lat) : existing.lat,
    lng: req.body.lng !== undefined ? Number(req.body.lng) : existing.lng,
    year: req.body.year !== undefined ? Number(req.body.year) : existing.year,
  };

  imageDatabase[index] = updated;
  saveData();

  res.json({
    message: 'Record updated successfully',
    image: updated
  });
});

// 5. DELETE /api/images/:id
app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = imageDatabase.length;
  imageDatabase = imageDatabase.filter(img => img.id !== id);

  if (imageDatabase.length === initialLength) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  saveData();
  res.json({ message: 'Record deleted successfully', id });
});

// 6. POST /api/images/seed (Reset database)
app.post('/api/images/seed', (req, res) => {
  imageDatabase = [...INITIAL_IMAGES];
  saveData();
  res.json({
    message: 'Database reset to initial Venice baseline dataset',
    count: imageDatabase.length
  });
});

// 7. GET /api/stats
app.get('/api/stats', (req, res) => {
  const total = imageDatabase.length;
  const categoryCounts: Record<string, number> = {
    photograph: 0,
    painting: 0,
    map: 0,
    sketch: 0
  };

  const districtCounts: Record<string, number> = {};
  const eraCounts: Record<string, number> = {};

  imageDatabase.forEach(img => {
    categoryCounts[img.category] = (categoryCounts[img.category] || 0) + 1;
    districtCounts[img.district] = (districtCounts[img.district] || 0) + 1;
    eraCounts[img.era] = (eraCounts[img.era] || 0) + 1;
  });

  res.json({
    totalImages: total,
    categories: categoryCounts,
    districts: districtCounts,
    eras: eraCounts,
    lastUpdated: new Date().toISOString()
  });
});

// 8. GET /api/districts
app.get('/api/districts', (req, res) => {
  const districtsWithCounts = VENICE_DISTRICTS.map(d => {
    const count = imageDatabase.filter(img => img.district === d.italianName || img.district === d.name).length;
    return { ...d, imageCount: count };
  });
  res.json(districtsWithCounts);
});

// 9. GET /api/ads
app.get('/api/ads', (req, res) => {
  res.json(DEMO_ADS);
});

// Serve public static assets
app.use(express.static(path.join(process.cwd(), 'public')));

// VITE SERVING SETUP
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
