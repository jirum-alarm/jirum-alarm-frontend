'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { themePath } from '@/shared/api/notification/theme.service';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import Button from '@/shared/ui/common/Button';

import { ThemeQueries } from '@/entities/notification';

import { useThemeSubscription } from '../../model/useThemeSubscription';

const ThemeList = ({ isMobile = true }: { isMobile?: boolean }) => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());
  // SSR에서는 인증 쿠키 없이 빈 배열로 dehydrate되어 클라이언트 re-fetch가 안 됨
  // → useQuery + initialData:[] 로 클라이언트에서만 fetch
  const { data: subscribedIds = [] } = useQuery(ThemeQueries.mySubscribedIds());
  const { subscribe, unsubscribe, isPendingFor } = useThemeSubscription();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const subscribed = new Set(subscribedIds);

  return (
    <ul className={isMobile ? 'flex flex-col gap-3 pb-32' : 'grid grid-cols-2 gap-4'}>
      {themes.map((theme) => {
        const themeId = Number(theme.id);
        const isSubscribed = subscribed.has(themeId);
        return (
          <li key={theme.id} className="h-full">
            {/* 홈 캐러셀 카드(widgets/home/ui/ThemeSection)와 같은 회색 카드 */}
            <Link
              href={themePath(theme)}
              className="flex h-full gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <span className="text-2xl" aria-hidden>
                {theme.emoji || '🔔'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-gray-900">{theme.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{theme.description}</p>
                {/* 깜깜이 구독 방지: 묶음에 어떤 키워드가 들었는지 미리보기 */}
                <p className="mt-2 line-clamp-1 text-xs text-gray-500">
                  {theme.representativeKeywords.join('·')}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {theme.keywords.length > 0 && <>키워드 {theme.keywords.length}개 · </>}
                  최근 7일 알림{' '}
                  <b className="font-semibold text-gray-900">{theme.weeklyAlertCount}건</b>
                </p>
              </div>
              <Button
                size="sm"
                color={isSubscribed ? 'secondary' : 'primary'}
                disabled={isPendingFor(themeId)}
                className="w-auto shrink-0 self-start px-3 py-1 text-sm disabled:opacity-50"
                onClick={(e) => {
                  e.preventDefault(); // 카드 링크 이동 막고 구독만
                  if (checkAndRedirect()) return; // 비로그인은 로그인으로 유도
                  if (isSubscribed) unsubscribe(themeId);
                  else subscribe(themeId);
                }}
              >
                {isSubscribed ? '받는 중' : '알림 받기'}
              </Button>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ThemeList;
