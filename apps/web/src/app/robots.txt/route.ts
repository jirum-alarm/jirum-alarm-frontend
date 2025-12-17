import { NextResponse } from 'next/server';

import { METADATA_SERVICE_URL } from '@/constants/env';

export function GET() {
  const robotsTxt = `User-agent: *
Disallow: /admin/
Disallow: /my/
Allow: /

Sitemap: https://cdn.jirum-alarm.com/sitemap/title-index.xml
Host: ${METADATA_SERVICE_URL}

#DaumWebMasterTool:23923d97dcee44c14f5c6b379f1bb5affe2d9cb6fcd4560b5e3c648b9e856318:jEv4QRLqgJxV7IQJ1W7Mww==`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
