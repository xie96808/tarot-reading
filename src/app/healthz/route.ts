export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ ok: true, service: 'zhu-xia-tarot', revision: process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'development' });
}
