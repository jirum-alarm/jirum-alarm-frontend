import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ModelPageService } from '@/shared/api/model-page';

import DealsMobileHeader from './[slug]/DealsMobileHeader';

// /deals 인덱스 — 퍼블리시된 모델 페이지(상품별 핫딜 최저가 모음)를 한눈에 모아보는 허브.
// 각 카드 → /deals/{slug}. 모델 페이지들의 SEO 내부링크 허브이자 둘러보기 진입점.
// ★현재 사이트 내부 메뉴엔 안 걸림(격리) — sitemap 등재 + URL 직접 접속.

export const metadata: Metadata = {
  title: '핫딜 최저가 모음 | 지름알림',
  description:
    '인기 상품별 핫딜 최저가를 한곳에. 음료·식품·가전·생필품까지 커뮤니티 핫딜과 다나와 최저가를 모아 비교하세요.',
  alternates: { canonical: '/deals' },
  openGraph: {
    title: '핫딜 최저가 모음 | 지름알림',
    description: '인기 상품별 핫딜 최저가를 한곳에 모아 비교하세요.',
    url: '/deals',
  },
};

export const revalidate = 600; // 10분 ISR — 목록은 자주 안 바뀜

export default async function DealsIndexPage() {
  const pages = await ModelPageService.getPublishedModelPages();

  return (
    <main className="max-w-mobile-max mx-auto w-full px-5 pt-20 pb-24">
      <DealsMobileHeader title="핫딜 최저가 모음" />

      <header className="mb-5">
        <h1 className="text-2xl font-bold text-black">핫딜 최저가 모음</h1>
        <p className="mt-1 text-sm text-gray-500">
          인기 상품별로 커뮤니티 핫딜과 다나와 최저가를 모았어요.
        </p>
      </header>

      {pages.length === 0 ? (
        <p className="py-20 text-center text-gray-400">준비 중이에요.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {pages.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/deals/${p.slug}`}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square w-full bg-gray-50">
                  {p.heroImage ? (
                    <Image
                      src={p.heroImage}
                      alt={p.modelName}
                      fill
                      sizes="(max-width: 600px) 50vw, 300px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="flex grow flex-col gap-1 p-3">
                  <h2 className="line-clamp-2 text-sm font-semibold text-black">{p.modelName}</h2>
                  {p.heroMinPrice != null ? (
                    <div className="mt-auto">
                      <p className="text-base font-bold text-rose-500">
                        {p.heroMinPrice.toLocaleString()}원
                      </p>
                      {p.unitLabel && p.unitPrice != null && (
                        <p className="text-xs text-gray-400">
                          {p.unitLabel} {p.unitPrice.toLocaleString()}원
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-auto text-xs text-gray-400">핫딜 {p.dealCount}건</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
