'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { ThemeQueries } from '@/entities/notification';

import { useThemeSubscription } from '../../model/useThemeSubscription';

const ThemeDetail = ({ themeId }: { themeId: number }) => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds } = useSuspenseQuery(ThemeQueries.mySubscribedIds());
  const { data: deals } = useSuspenseQuery(ThemeQueries.liveDeals(themeId));
  const { subscribe, unsubscribe, isPending } = useThemeSubscription();

  const theme = themes.find((t) => Number(t.id) === themeId);
  if (!theme) return null;

  const isSubscribed = new Set(subscribedIds).has(themeId);

  return (
    <div className="pb-32">
      {/* 헤더: 이모지 + 이름 + 설명 */}
      <div className="flex items-start gap-2">
        {theme.emoji && <span className="text-2xl">{theme.emoji}</span>}
        <div>
          <h2 className="text-lg font-bold text-gray-900">{theme.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{theme.description}</p>
        </div>
      </div>

      {/* 포함 키워드 — 무엇이 묶였나 */}
      <div className="mt-5">
        <h3 className="mb-2 text-sm font-medium text-gray-900">포함 키워드</h3>
        <div className="flex flex-wrap gap-1.5">
          {theme.representativeKeywords.map((keyword) => (
            <span key={keyword} className="rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* 라이브 딜 — 지금 이 묶음에 뜬 딜 (구독 전 가치 증명) */}
      <div className="mt-7">
        <h3 className="mb-3 text-sm font-medium text-gray-900">
          🔥 지금 이 묶음에 뜬 딜 <span className="text-primary-500">{deals.length}</span>
        </h3>
        {deals.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">지금은 뜬 딜이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {deals.map((deal) => (
              <li key={deal.id}>
                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  {deal.thumbnail && (
                    <Image
                      src={deal.thumbnail}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      unoptimized
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-gray-900">{deal.title}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {deal.price
                        ? `${deal.price.toLocaleString()}${deal.priceCurrency === 'USD' ? '달러' : '원'}`
                        : ''}
                      {deal.provider?.nameKr && (
                        <span className="ml-1.5 text-xs font-normal text-gray-400">
                          {deal.provider.nameKr}
                        </span>
                      )}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 하단 고정 구독 버튼 */}
      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (isSubscribed) unsubscribe(themeId);
            else subscribe(themeId);
          }}
          className={`w-full rounded-xl py-3.5 text-base font-semibold disabled:opacity-50 ${
            isSubscribed ? 'bg-gray-100 text-gray-500' : 'bg-primary-500 text-white'
          }`}
        >
          {isSubscribed ? '구독 중 (해지하기)' : '이 묶음 구독'}
        </button>
      </div>
    </div>
  );
};

export default ThemeDetail;
