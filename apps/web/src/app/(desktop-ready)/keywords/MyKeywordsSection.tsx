'use client';

import { linkChip } from '@jirum/design-system/recipes';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { PAGE } from '@/shared/config/page';
import { isGuestAtom, isLoggedInAtom } from '@/shared/hooks/useIsLoggedIn';
import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { findKeywordHubForQuery, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';
import { useKeywordHubs } from '@/entities/keyword-hub/model/useKeywordHubs';

/**
 * 키워드 탭 맨 위 — 내가 알림을 건 키워드. 2026-10-20 하단 탭 「키워드」가 되면서 «둘러보다 그 자리에서 알림» 흐름의 시작점.
 * 허브인 키워드는 그 30일 모음으로, 아니면 지금 올라온 딜 검색으로 보낸다(내 키워드 화면의 「핫딜 모아보기」·「지금 올라온 딜 보기」와 같은 갈림).
 * 키워드가 없거나 계정이 없으면 등록으로 이끄는 한 줄. 앱 KeywordsTabScreen 의 MyKeywords 와 짝.
 */
export default function MyKeywordsSection() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const isGuest = useAtomValue(isGuestAtom);
  const hasAccount = isLoggedIn || isGuest;
  const { data, isPending } = useQuery({
    ...AuthQueries.myKeywords({ limit: 20 }),
    enabled: hasAccount,
  });
  const { data: hubs } = useKeywordHubs();

  // 계정이 있는데 아직 받는 중이면 비워 둔다 — 「키워드를 걸어 보세요」가 깜빡였다 사라지면 더 거슬린다.
  if (hasAccount && isPending) return <div className="mb-8 h-20" aria-hidden />;

  const keywords = data?.notificationKeywordsByMe ?? [];

  if (keywords.length === 0) {
    return (
      <section className="mb-8 rounded-xl bg-gray-50 px-4 py-4">
        <p className="text-sm font-semibold text-gray-900">
          키워드를 걸어 두면 핫딜이 올라올 때 알려 드려요
        </p>
        <p className="mt-1 text-xs text-gray-500">
          아래 키워드를 눌러 30일 핫딜을 보고, 마음에 들면 그 자리에서 알림을 걸 수 있어요.
        </p>
        <Link
          href={PAGE.MYPAGE_KEYWORD}
          data-track="keyword-tab-register"
          className="bg-primary-500 text-fixed-900 mt-3 inline-block rounded-md px-4 py-2 text-sm font-semibold"
        >
          키워드 알림 걸기
        </Link>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-gray-900">내 키워드</h2>
        <Link
          href={PAGE.MYPAGE_KEYWORD}
          data-track="keyword-tab-manage"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          알림 관리 ›
        </Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {keywords.map(({ id, keyword }) => {
          const hub = hubs ? findKeywordHubForQuery(keyword, hubs) : undefined;
          return (
            <li key={id}>
              <Link
                href={
                  hub
                    ? keywordHubPath(hub)
                    : `${PAGE.SEARCH}?keyword=${encodeURIComponent(keyword)}`
                }
                data-track={hub ? 'keyword-hub-link' : 'keyword-tab-search'}
                data-source="keyword_tab_mine"
                className={cn('inline-block', linkChip)}
              >
                {keyword}
                {hub && <span className="ml-1 text-gray-500">›</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
