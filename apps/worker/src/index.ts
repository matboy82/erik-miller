export default {
  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path !== '/' && path !== '/health') {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const response = Response.json({ status: 'ok', service: 'miller-remodeling-intake', stage: 'scaffold' }, {
      headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
    return request.method === 'HEAD' ? new Response(null, response) : response;
  },
};
