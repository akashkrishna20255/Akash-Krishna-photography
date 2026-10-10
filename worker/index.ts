// Cloudflare Worker for Akash Krishna Portfolio Gallery with PHOTO_KV Binding
// Provides persistent storage for project photos via Cloudflare KV

export interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

export interface Env {
  PHOTO_KV: KVNamespace;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    try {
      // -----------------------------------------------------------
      // 1. Direct KV Key-Value Endpoints (e.g., photo_1 as requested)
      // -----------------------------------------------------------
      if (pathname.startsWith('/api/kv/')) {
        const key = decodeURIComponent(pathname.replace('/api/kv/', ''));

        // READ: env.PHOTO_KV.get(key) -> e.g. env.PHOTO_KV.get("photo_1")
        if (request.method === 'GET') {
          if (!env.PHOTO_KV) {
            return jsonResponse({ error: 'PHOTO_KV binding not configured' }, 500);
          }
          const raw = await env.PHOTO_KV.get(key, 'text');
          if (!raw) {
            return jsonResponse({ error: `Key '${key}' not found in PHOTO_KV` }, 404);
          }
          try {
            return jsonResponse(JSON.parse(raw));
          } catch {
            return new Response(raw, { headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' } });
          }
        }

        // WRITE: env.PHOTO_KV.put(key, data) -> e.g. env.PHOTO_KV.put("photo_1", data)
        if (request.method === 'POST' || request.method === 'PUT') {
          if (!env.PHOTO_KV) {
            return jsonResponse({ error: 'PHOTO_KV binding not configured' }, 500);
          }
          const contentType = request.headers.get('content-type') || '';
          const bodyData = contentType.includes('application/json')
            ? JSON.stringify(await request.json())
            : await request.text();

          await env.PHOTO_KV.put(key, bodyData);
          return jsonResponse({
            success: true,
            key,
            message: `Successfully written to env.PHOTO_KV.put("${key}", data)`
          });
        }

        // DELETE
        if (request.method === 'DELETE') {
          if (!env.PHOTO_KV) {
            return jsonResponse({ error: 'PHOTO_KV binding not configured' }, 500);
          }
          await env.PHOTO_KV.delete(key);
          return jsonResponse({ success: true, key, message: `Deleted ${key} from PHOTO_KV` });
        }
      }

      // -----------------------------------------------------------
      // 2. Photos Collection Endpoints (/api/photos)
      // -----------------------------------------------------------
      if (pathname === '/api/photos') {
        // READ ALL: Read photos array from PHOTO_KV
        if (request.method === 'GET') {
          if (!env.PHOTO_KV) {
            return jsonResponse([]);
          }
          const savedPhotos = await env.PHOTO_KV.get('photos', 'json');
          if (savedPhotos && Array.isArray(savedPhotos)) {
            return jsonResponse(savedPhotos);
          }

          // Check if single photo_1 exists as fallback
          const photo1 = await env.PHOTO_KV.get('photo_1', 'json');
          if (photo1) {
            return jsonResponse([photo1]);
          }

          return jsonResponse([]);
        }

        // SAVE ALL / BULK: env.PHOTO_KV.put("photos", data) and env.PHOTO_KV.put("photo_1", ...)
        if (request.method === 'POST') {
          if (!env.PHOTO_KV) {
            return jsonResponse({ error: 'PHOTO_KV binding not configured' }, 500);
          }
          const body = await request.json();

          if (Array.isArray(body)) {
            // Write full array
            await env.PHOTO_KV.put('photos', JSON.stringify(body));

            // Write first photo to photo_1 key as requested: env.PHOTO_KV.put("photo_1", data)
            if (body.length > 0) {
              await env.PHOTO_KV.put('photo_1', JSON.stringify(body[0]));
            }

            return jsonResponse({
              success: true,
              count: body.length,
              message: 'Saved photos collection to PHOTO_KV and updated photo_1'
            });
          } else if (body && typeof body === 'object') {
            // Single photo save
            await env.PHOTO_KV.put('photo_1', JSON.stringify(body));
            return jsonResponse({
              success: true,
              message: 'Saved single photo to env.PHOTO_KV.put("photo_1", data)'
            });
          }

          return jsonResponse({ error: 'Invalid payload' }, 400);
        }
      }

      // -----------------------------------------------------------
      // 3. Single Photo Item Endpoints (/api/photos/:id)
      // -----------------------------------------------------------
      if (pathname.startsWith('/api/photos/')) {
        const id = decodeURIComponent(pathname.replace('/api/photos/', ''));

        // GET single photo
        if (request.method === 'GET') {
          if (!env.PHOTO_KV) return jsonResponse({ error: 'PHOTO_KV not found' }, 500);
          const photo = await env.PHOTO_KV.get(`photo_${id}`, 'json');
          if (photo) return jsonResponse(photo);
          return jsonResponse({ error: 'Photo not found' }, 404);
        }

        // UPDATE single photo
        if (request.method === 'PUT' || request.method === 'POST') {
          if (!env.PHOTO_KV) return jsonResponse({ error: 'PHOTO_KV not found' }, 500);
          const updatedPhoto = await request.json();

          // Write to individual photo key
          await env.PHOTO_KV.put(`photo_${id}`, JSON.stringify(updatedPhoto));
          await env.PHOTO_KV.put('photo_1', JSON.stringify(updatedPhoto));

          // Also update in main collection
          const currentCollection = (await env.PHOTO_KV.get('photos', 'json')) || [];
          if (Array.isArray(currentCollection)) {
            const index = currentCollection.findIndex((p: any) => p.id === id);
            let nextCollection = [...currentCollection];
            if (index >= 0) {
              nextCollection[index] = { ...nextCollection[index], ...updatedPhoto };
            } else {
              nextCollection.unshift(updatedPhoto);
            }
            await env.PHOTO_KV.put('photos', JSON.stringify(nextCollection));
          }

          return jsonResponse({
            success: true,
            id,
            message: `Updated photo in env.PHOTO_KV for ${id}`
          });
        }

        // DELETE single photo
        if (request.method === 'DELETE') {
          if (!env.PHOTO_KV) return jsonResponse({ error: 'PHOTO_KV not found' }, 500);
          await env.PHOTO_KV.delete(`photo_${id}`);

          // Also remove from collection
          const currentCollection = (await env.PHOTO_KV.get('photos', 'json')) || [];
          if (Array.isArray(currentCollection)) {
            const nextCollection = currentCollection.filter((p: any) => p.id !== id);
            await env.PHOTO_KV.put('photos', JSON.stringify(nextCollection));
          }

          return jsonResponse({ success: true, id, message: `Deleted photo ${id} from PHOTO_KV` });
        }
      }

      // If Cloudflare Worker has static assets attached
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }

      // 404 for unhandled API routes
      if (pathname.startsWith('/api/')) {
        return jsonResponse({ error: 'Not found' }, 404);
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: any) {
      console.error('Worker Error:', err);
      return jsonResponse({ error: err?.message || 'Internal Worker Error' }, 500);
    }
  }
};
