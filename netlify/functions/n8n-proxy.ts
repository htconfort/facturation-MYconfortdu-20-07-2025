// Type minimal pour compat Netlify sans dépendance de types
type Handler = (event: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;

// Proxy sécurisé vers n8n, en lisant l'URL depuis les variables d'environnement
// Usage: /api/n8n/<endpoint> (ex: /api/n8n/webhook/facture-universelle)

const ALLOWED_PREFIX = 'webhook/';

export const handler: Handler = async (event) => {
  try {
    const originalPath = event.path || '';
    const endpoint = originalPath.replace(/^.*\/api\/n8n\//, '');

    if (!endpoint || !endpoint.startsWith(ALLOWED_PREFIX)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid endpoint',
          details: 'Only webhook/* endpoints are allowed',
        }),
      };
    }

    const baseUrl = (globalThis as any).process?.env?.VITE_N8N_WEBHOOK_URL || (globalThis as any).process?.env?.N8N_BASE_URL;
    if (!baseUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'N8N base URL missing (configure VITE_N8N_WEBHOOK_URL)' }),
      };
    }

    // Conserver la query string (ex: ?key=SESSION_ID)
    const query = event.rawQuery ? `?${event.rawQuery}` : '';
    const target = `${baseUrl.replace(/\/$/, '')}/${endpoint}${query}`;

    const method = event.httpMethod || 'POST';
    const headers: Record<string, string> = {
      'Content-Type': event.headers['content-type'] || 'application/json',
      Accept: 'application/json',
      'User-Agent': 'MYCONFORT-Netlify-Proxy/1.0',
    };

    // Transmet aussi un secret facultatif si défini (X-Webhook-Secret côté n8n)
    if ((globalThis as any).process?.env?.VITE_N8N_WEBHOOK_SECRET) {
      headers['X-Webhook-Secret'] = (globalThis as any).process.env.VITE_N8N_WEBHOOK_SECRET as string;
    }

    const resp = await fetch(target, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : event.body,
    });

    const text = await resp.text();

    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
      body: text,
    };
  } catch (err: any) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Proxy error', message: err?.message || 'unknown' }),
    };
  }
};

export default handler;

