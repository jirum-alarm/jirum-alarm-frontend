'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ThemeQueries } from '@/entities/notification';

import { useThemeSubscription } from '../../model/useThemeSubscription';

const ThemeList = () => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds } = useSuspenseQuery(ThemeQueries.mySubscribedIds());
  const { subscribe, unsubscribe, isPending } = useThemeSubscription();

  const subscribed = new Set(subscribedIds);

  return (
    <ul className="pc:grid pc:grid-cols-2 pc:gap-4 pc:pb-0 flex flex-col gap-3 pb-32">
      {themes.map((theme) => {
        const isSubscribed = subscribed.has(theme.id);
        return (
          <li key={theme.id}>
            <Link
              href={`/themes/${theme.id}`}
              className="block rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {theme.emoji && <span aria-hidden>{theme.emoji}</span>}
                    <span className="text-base font-semibold text-gray-900">{theme.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{theme.description}</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault(); // 카드 링크 이동 막고 구독만
                    if (isSubscribed) unsubscribe(theme.id);
                    else subscribe(theme.id);
                  }}
                  className={`ml-3 shrink-0 rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
                    isSubscribed ? 'bg-gray-100 text-gray-500' : 'bg-primary-500 text-white'
                  }`}
                >
                  {isSubscribed ? '구독중' : '구독'}
                </button>
              </div>
              {/* 깜깜이 구독 방지: 묶음에 어떤 키워드가 들었는지 미리보기 */}
              {theme.representativeKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {theme.representativeKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ThemeList;
