// Cloudflare Pages Function: /api/kv/[key]
// Direct key-value operations on PHOTO_KV (e.g., photo_1)

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

export const onRequestGet = async (context: { params: { key: string }; env: Env }) => {
  const { params, env } = context;
  const key = params.key;

  if (!env.PHOTO_KV) {
    return new Response(JSON.stringify({ error: 'PHOTO_KV not bound' }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  const value = await env.PHOTO_KV.get(key, 'text');
  if (!value) {
    return new Response(JSON.stringify({ error: `Key ${key} not found` }), {
      status: 404,
      headers: CORS_HEADERS
    });
  }

  try {
    return new Response(value, { headers: CORS_HEADERS });
  } catch {
    return new Response(value, {
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' }
    });
  }
};

export const onRequestPost = async (context: {
  request: Request;
  params: { key: string };
  env: Env;
}) => {
  const { request, params, env } = context;
  const key = params.key;

  if (!env.PHOTO_KV) {
    return new Response(JSON.stringify({ error: 'PHOTO_KV not bound' }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  const text = await request.text();
  await env.PHOTO_KV.put(key, text);

  return new Response(
    JSON.stringify({ success: true, key, message: `Written to env.PHOTO_KV.put("${key}", data)` }),
    { headers: CORS_HEADERS }
  );
};
