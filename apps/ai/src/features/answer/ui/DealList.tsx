'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { Deal } from '../model/types';

const convertToWebp = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
};

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);
  const webpSrc = convertToWebp(src);

  if (!webpSrc || broken) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <svg
          className="size-5 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={webpSrc}
      alt={alt}
      width={56}
      height={56}
      className="size-14 shrink-0 rounded-lg object-cover"
      onError={() => setBroken(true)}
    />
  );
}

/**
 * 미리보기 개수. 모바일 1열이면 3건, PC 2열이면 4건(2x2)이 빈칸 없이 맞는다.
 * 서버가 12건까지 보내고 나머지는 '더 보기' 로 접는다.
 */
const PREVIEW_MOBILE = 3;
const PREVIEW_DESKTOP = 4;

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

const priceOf = (d: Deal) => {
  if (d.parsedPrice == null) return '가격 미확인';
  if (d.priceCurrency && d.priceCurrency !== 'KRW') return `${d.parsedPrice} ${d.priceCurrency}`;
  return won(d.parsedPrice);
};

const daysAgo = (iso: string | null): string | null => {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  return `${days}일 전`;
};

/**
 * 딜 목록.
 *
 * ★12개를 세로로 쌓으면 채팅 답변이 화면을 삼킨다(사용자 지적: "상품을 저렇게 아래로
 * 내려뜨려서 보여줘야 하나"). 기본은 **3건만** 보여주고 나머지는 접는다.
 * 대화 흐름이 목록에 묻히지 않게 하는 것이 핵심 — 목록은 근거이고 답이 아니다.
 */
export default function DealList({ deals, lowest }: { deals: Deal[]; lowest: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(PREVIEW_MOBILE);

  // md 브레이크포인트(768px)에서 2열이 되므로 미리보기를 4건으로 — 2x2 로 빈칸이 없다
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setPreview(mq.matches ? PREVIEW_DESKTOP : PREVIEW_MOBILE);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (deals.length === 0) return null;

  const shown = expanded ? deals : deals.slice(0, preview);
  const hidden = deals.length - shown.length;

  return (
    <div className="flex flex-col gap-2">
      <ul className="grid gap-2 md:grid-cols-2">
        {shown.map((d) => {
          const isLowest = lowest != null && d.parsedPrice === lowest;
          return (
            <li key={d.id}>
              <a
                href={d.url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={d.url ? undefined : true}
                className={[
                  'tappable tappable-surface block rounded-xl border p-3',
                  isLowest ? 'border-error-500 bg-error-50/40' : 'border-gray-200 bg-white',
                  d.url ? '' : 'pointer-events-none opacity-70',
                ].join(' ')}
              >
                <div className="flex gap-2.5">
                  <Thumbnail src={d.thumbnail} alt={d.title} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      {isLowest && (
                        <span className="bg-error-500 rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
                          최저가
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500">
                        {[d.mallName, daysAgo(d.postedAt)].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[13px] leading-snug text-gray-700">{d.title}</p>
                    <div className="mt-0.5 flex items-baseline justify-between gap-2">
                      <span className="text-[15px] font-bold text-gray-900 tabular-nums">
                        {priceOf(d)}
                      </span>
                      {d.url && (
                        <svg
                          className="size-3.5 shrink-0 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="tappable min-h-11 rounded-xl border border-gray-200 bg-white py-2.5 text-[13px] font-medium text-gray-600 active:bg-gray-50"
        >
          {hidden}개 더 보기
        </button>
      )}
      {expanded && deals.length > preview && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="tappable min-h-11 rounded-xl border border-gray-200 bg-white py-2.5 text-[13px] font-medium text-gray-500 active:bg-gray-50"
        >
          접기
        </button>
      )}
    </div>
  );
}
