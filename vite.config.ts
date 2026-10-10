import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, Plugin} from 'vite';

function mockKvApiPlugin(): Plugin {
  const storeFilePath = path.resolve(__dirname, 'persisted_kv.json');

  const loadStore = (): Record<string, any> => {
    try {
      if (fs.existsSync(storeFilePath)) {
        const raw = fs.readFileSync(storeFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load persisted_kv.json:', err);
    }
    return {};
  };

  const saveStore = (data: Record<string, any>) => {
    try {
      fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save to persisted_kv.json:', err);
    }
  };

  const kvStore = loadStore();

  return {
    name: 'mock-kv-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // /api/photos
        if (pathname === '/api/photos') {
          if (req.method === 'GET') {
            res.statusCode = 200;
            const current = loadStore();
            const photos = current['photos'] || kvStore['photos'] || [];
            return res.end(JSON.stringify(photos));
          }
          if (req.method === 'POST') {
            const chunks: any[] = [];
            req.on('data', (chunk: any) => { chunks.push(chunk); });
            req.on('end', () => {
              try {
                const body = Buffer.concat(chunks.map(c => Buffer.isBuffer(c) ? c : Buffer.from(c))).toString('utf-8');
                const parsed = JSON.parse(body);
                kvStore['photos'] = parsed;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  kvStore['photo_1'] = parsed[0];
                }
                saveStore(kvStore);
                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, count: parsed.length }));
              } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
              }
            });
            return;
          }
        }

        // /api/kv/:key
        if (pathname.startsWith('/api/kv/')) {
          const key = decodeURIComponent(pathname.replace('/api/kv/', ''));
          if (req.method === 'GET') {
            const current = loadStore();
            const val = current[key] ?? kvStore[key];
            if (val === undefined) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Key not found' }));
            }
            res.statusCode = 200;
            return res.end(typeof val === 'string' ? val : JSON.stringify(val));
          }
          if (req.method === 'POST' || req.method === 'PUT') {
            const chunks: any[] = [];
            req.on('data', (chunk: any) => { chunks.push(chunk); });
            req.on('end', () => {
              const body = Buffer.concat(chunks.map(c => Buffer.isBuffer(c) ? c : Buffer.from(c))).toString('utf-8');
              try {
                kvStore[key] = JSON.parse(body);
              } catch {
                kvStore[key] = body;
              }
              saveStore(kvStore);
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, key }));
            });
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mockKvApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3005',
          changeOrigin: true,
        },
      },
    },
  };
});

