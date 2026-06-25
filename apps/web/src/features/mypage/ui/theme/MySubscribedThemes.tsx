'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ThemeQueries } from '@/entities/notification';

import { useThemeSubscription } from '../../model/useThemeSubscription';

// 키워드 관리 페이지 통합용: 내가 구독한 묶음만. (묶음) 배지 + 묶음 단위 해제.
// 개별 키워드 목록(KeywordList) 위에 노출해 "키워드 + 묶음"을 한 화면에서 관리.
const MySubscribedThemes = () => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds } = useSuspenseQuery(ThemeQueries.mySubscribedIds());
  const { unsubscribe, isPending } = useThemeSubscription();

  const subscribedSet = new Set(subscribedIds);
  const mine = themes.filter((t) => subscribedSet.has(Number(t.id)));

  if (mine.length === 0) return null;

  return (
    <div className="pb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">구독한 묶음</span>
        <Link href="/themes" className="text-xs text-gray-400">
          묶음 더보기
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {mine.map((theme) => (
          <li
            key={theme.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5"
          >
            <Link href={`/themes/${theme.id}`} className="flex min-w-0 flex-col gap-1">
              <span className="flex min-w-0 items-center gap-1.5">
                {theme.emoji && <span aria-hidden>{theme.emoji}</span>}
                <span className="truncate text-sm text-gray-900">{theme.name}</span>
              </span>
              <span className="bg-primary-50 text-primary-500 w-fit rounded px-1.5 py-0.5 text-[11px] font-medium">
                묶음
              </span>
            </Link>
            <button
              type="button"
              disabled={isPending}
              onClick={() => unsubscribe(Number(theme.id))}
              aria-label="묶음 구독 해제"
              className="-m-2 shrink-0 p-2 text-xs text-gray-400 disabled:opacity-50"
            >
              해제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MySubscribedThemes;
