// Empty 204 response to remove favicon and suppress 404 browser logs
export function GET() {
  return new Response(null, {
    status: 204,
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
