import { NextResponse } from 'next/server';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

// ponytail: 네이버 서치어드바이저 RSS 수집용. 네이버는 sitemap보다 RSS 수집이 빠르고
// 핫딜처럼 신선도가 생명인 콘텐츠에 유리. force-dynamic — 최신 핫딜이 즉시 반영돼야 함.
export const dynamic = 'force-dynamic';

const FEED_SIZE = 30;

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      default:
        return '&quot;';
    }
  });
}

export async function GET() {
  const base = METADATA_SERVICE_URL;

  let products: NonNullable<Awaited<ReturnType<typeof ProductService.getProducts>>>['products'] =
    [];
  try {
    const data = await ProductService.getProducts({
      limit: FEED_SIZE,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
      isEnd: false,
    });
    products = data?.products ?? [];
  } catch {
    // 조회 실패 시 빈 피드라도 유효한 XML을 반환한다(500 대신).
    products = [];
  }

  const items = products
    .map((p) => {
      const link = `${base}/products/${p.id}`;
      const title = p.price ? `${p.title} (${p.price})` : p.title;
      const pubDate = p.postedAt ? new Date(p.postedAt).toUTCString() : undefined;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>${
        p.category ? `\n      <category>${escapeXml(p.category)}</category>` : ''
      }${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ''}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>지름알림 - 실시간 핫딜</title>
    <link>${base}</link>
    <description>뽐뿌·클리앙·루리웹·퀘이사존 등 커뮤니티 핫딜을 실시간으로 모아 최저가와 비교합니다.</description>
    <language>ko</language>
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
