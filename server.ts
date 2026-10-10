import express from 'express';
import { db } from './src/db';
import { photos, siteSettings } from './src/db/schema';
import { eq } from 'drizzle-orm';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// API Endpoints
app.get('/api/photos', async (req, res) => {
  try {
    const allPhotos = await db.select().from(photos);
    res.json(allPhotos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

app.post('/api/photos', async (req, res) => {
  try {
    const newPhotos = req.body;
    // For simplicity, we'll replace the photos table. A better way would be upsert.
    await db.delete(photos);
    if (newPhotos.length > 0) {
        await db.insert(photos).values(newPhotos);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save photos' });
  }
});

app.get('/api/site-content', async (req, res) => {
  try {
    const settings = await db.select().from(siteSettings);
    res.json(settings[0]?.content || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

app.post('/api/site-content', async (req, res) => {
  try {
    const content = req.body;
    const settings = await db.select().from(siteSettings);
    
    if (settings.length > 0) {
      await db.update(siteSettings).set({ content }).where(eq(siteSettings.id, settings[0].id));
    } else {
      await db.insert(siteSettings).values({ content });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save site settings' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
