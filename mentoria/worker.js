// Cloudflare Worker — Proxy CORS pour l'API Albert (Etalab)
// Déploiement : https://workers.cloudflare.com
// Remplace l'appel direct depuis le navigateur pour contourner le blocage CORS.

export default {
  async fetch(request) {

    const ALBERT_URL = 'https://albert.api.etalab.gouv.fr/v1/chat/completions';

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Réponse au preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const albertRes = await fetch(ALBERT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') ?? '',
        },
        body: request.body,
      });

      return new Response(albertRes.body, {
        status: albertRes.status,
        headers: {
          ...corsHeaders,
          'Content-Type': albertRes.headers.get('Content-Type') ?? 'application/json',
        },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
