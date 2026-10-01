import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API Route for YouTube & Google search suggestions
  app.get('/api/search/suggestions', async (req, res) => {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.json({ suggestions: [] });
    }
    try {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q.trim())}`;
      const r = await fetch(suggestUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      if (r.ok) {
        const data = await r.json() as any;
        const suggestions = Array.isArray(data?.[1]) ? data[1].slice(0, 10) : [];
        return res.json({ suggestions });
      }
      return res.json({ suggestions: [] });
    } catch (e: any) {
      console.warn('Error fetching suggestions:', e.message);
      return res.json({ suggestions: [] });
    }
  });

  // API Route for real-time YouTube music search
  app.get('/api/search/tracks', async (req, res) => {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.json({ tracks: [] });
    }

    try {
      const cleanQuery = q.trim();
      const searchQuery = (!cleanQuery.toLowerCase().includes('audio') && !cleanQuery.toLowerCase().includes('letra') && !cleanQuery.toLowerCase().includes('lyrics'))
        ? `${cleanQuery} audio`
        : cleanQuery;

      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      const ytRes = await fetch(ytUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-419,es;q=0.9,en;q=0.8'
        }
      });

      if (ytRes.ok) {
        const html = await ytRes.text();
        const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s) || html.match(/var ytInitialData\s*=\s*({.+?});/s);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
          if (Array.isArray(contents)) {
            const results: any[] = [];
            for (const section of contents) {
              const items = section.itemSectionRenderer?.contents;
              if (!items) continue;
              for (const item of items) {
                const v = item.videoRenderer;
                if (!v || !v.videoId) continue;
                const durationText = v.lengthText?.simpleText || '3:30';
                let durationSec = 210;
                if (durationText) {
                  const parts = durationText.split(':').map(Number);
                  if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
                  if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }
                results.push({
                  id: `yt-search-${v.videoId}`,
                  title: v.title?.runs?.[0]?.text || 'Canción',
                  artist: v.ownerText?.runs?.[0]?.text || 'Artista',
                  duration: durationSec,
                  durationFormatted: durationText,
                  youtubeId: v.videoId,
                  coverUrl: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
                  sourceUrl: `https://www.youtube.com/watch?v=${v.videoId}`
                });
                if (results.length >= 20) break;
              }
              if (results.length >= 20) break;
            }
            if (results.length > 0) {
              return res.json({ tracks: results });
            }
          }
        }
      }

      // Fallback: iTunes music API
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=15`);
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json() as any;
        const results = (itunesData.results || []).map((t: any) => ({
          id: `itunes-${t.trackId}`,
          title: t.trackName || 'Pista de Audio',
          artist: t.artistName || 'Artista',
          duration: Math.floor((t.trackTimeMillis || 180000) / 1000),
          youtubeId: '',
          coverUrl: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '400x400bb') : '',
          sourceUrl: t.previewUrl || ''
        }));
        return res.json({ tracks: results });
      }

      return res.json({ tracks: [] });
    } catch (e: any) {
      console.error('Error in /api/search/tracks:', e.message);
      return res.json({ tracks: [] });
    }
  });

  if (!isProd) {
    // In development mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Standard Vite SPA fallback for any route
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) return next();
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // In production mode, serve pre-built dist assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Capibara Sound server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting Capibara Sound server:', err);
});
