import { NextResponse } from 'next/server';

function toPublisherId(clientId: string) {
  return clientId.replace(/^ca-/, '');
}

export function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? '';

  if (!clientId) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const adsTxt = `google.com, ${toPublisherId(clientId)}, DIRECT, f08c47fec0942fa0`;

  return new NextResponse(adsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
