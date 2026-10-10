import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function mockKvApiPlugin(): Plugin {
  const inMemoryKv: Record<string, any> = {};

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
            return res.end(JSON.stringify(inMemoryKv['photos'] || []));
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                inMemoryKv['photos'] = parsed;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  inMemoryKv['photo_1'] = parsed[0];
                }
                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, message: 'Saved to mock KV' }));
              } catch {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }
        }

        // /api/kv/:key
        if (pathname.startsWith('/api/kv/')) {
          const key = decodeURIComponent(pathname.replace('/api/kv/', ''));
          if (req.method === 'GET') {
            const val = inMemoryKv[key];
            if (val === undefined) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Key not found' }));
            }
            res.statusCode = 200;
            return res.end(typeof val === 'string' ? val : JSON.stringify(val));
          }
          if (req.method === 'POST' || req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                inMemoryKv[key] = JSON.parse(body);
              } catch {
                inMemoryKv[key] = body;
              }
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
    },
  };
});

