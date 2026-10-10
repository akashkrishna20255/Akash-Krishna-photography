// Cloudflare Pages Function: /api/photos
// Supports reading from and writing to PHOTO_KV binding

interface Env {
  PHOTO_KV: any;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export const onRequestOptions = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet = async (context: { env: Env }) => {
  const { env } = context;
  if (!env.PHOTO_KV) {
    return new Response(JSON.stringify([]), { headers: CORS_HEADERS });
  }

  const photos = await env.PHOTO_KV.get('photos', 'json');
  if (photos && Array.isArray(photos)) {
    return new Response(JSON.stringify(photos), { headers: CORS_HEADERS });
  }

  const photo1 = await env.PHOTO_KV.get('photo_1', 'json');
  if (photo1) {
    return new Response(JSON.stringify([photo1]), { headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify([]), { headers: CORS_HEADERS });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  if (!env.PHOTO_KV) {
    return new Response(
      JSON.stringify({
        success: false,
        warning: 'PHOTO_KV binding not configured yet in Cloudflare Pages. Browser IndexedDB stores data safely.'
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  const body = await request.json();

  if (Array.isArray(body)) {
    await env.PHOTO_KV.put('photos', JSON.stringify(body));
    if (body.length > 0) {
      await env.PHOTO_KV.put('photo_1', JSON.stringify(body[0]));
    }
    return new Response(
      JSON.stringify({ success: true, count: body.length, message: 'Saved to PHOTO_KV' }),
      { headers: CORS_HEADERS }
    );
  }

  await env.PHOTO_KV.put('photo_1', JSON.stringify(body));
  return new Response(
    JSON.stringify({ success: true, message: 'Saved to photo_1 in PHOTO_KV' }),
    { headers: CORS_HEADERS }
  );
};
