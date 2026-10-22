'use client';

import { text } from '@jirum/design-system/recipes';
import { THEME_COPY } from '@jirum/domain/mypage';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { themePath } from '@/shared/api/notification/theme.service';
import { cn } from '@/shared/lib/cn';

import { ThemeQueries } from '@/entities/notification';

import { useThemeSubscription } from '../../model/useThemeSubscription';

// 키워드 관리 페이지 통합용: 내가 받고 있는 관심사 알림만. 배지 + 관심사 단위로 끄기.
// 개별 키워드 목록(KeywordList) 위에 노출해 "키워드 + 관심사"를 한 화면에서 관리.
const MySubscribedThemes = () => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  const { data: subscribedIds } = useSuspenseQuery(ThemeQueries.mySubscribedIds());
  const { unsubscribe, isPendingFor } = useThemeSubscription();

  const subscribedSet = new Set(subscribedIds);
  const mine = themes.filter((t) => subscribedSet.has(Number(t.id)));

  if (mine.length === 0) return null;

  return (
    <div className="pb-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className={text.subtitle}>{THEME_COPY.mySubscribedTitle}</h2>
        <Link href="/themes" className={cn(text.caption, 'hover:text-gray-700')}>
          {THEME_COPY.browseMore} ›
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {mine.map((theme) => (
          <li
            key={theme.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 py-3 pr-3 pl-4"
          >
            {/* 섹션 제목이 이미 "관심사" — 줄마다 붙던 라임 배지는 흰 바탕 대비 1.2:1 이라 뺐다. */}
            <Link href={themePath(theme)} className="flex min-w-0 items-center gap-2">
              {theme.emoji && <span aria-hidden>{theme.emoji}</span>}
              <span className={cn(text.label, 'truncate')}>{theme.name}</span>
            </Link>
            <button
              type="button"
              disabled={isPendingFor(Number(theme.id))}
              onClick={() => unsubscribe(Number(theme.id))}
              aria-label={`${theme.name} 알림 끄기`}
              className="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              끄기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MySubscribedThemes;
