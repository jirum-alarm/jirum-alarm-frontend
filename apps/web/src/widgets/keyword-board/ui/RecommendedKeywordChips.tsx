'use client';

import { addChip, text } from '@jirum/design-system/recipes';
import { KEYWORD_BOARD_COPY } from '@jirum/domain/keyword-board';
import { useQuery } from '@tanstack/react-query';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { useUpdateKeyword } from '@/entities/auth/model/update-keyword';

const MAX_CHIPS = 8;

/**
 * 「요즘 많이 받는 키워드」 — 누르면 그 자리에서 건다(내 키워드 화면 EmptyKeywords·앱 FirstAlertSheet 와 같은 추천 목록).
 * 키워드 탭에서 등록하면 상황판에 그 키워드 카드가 바로 생긴다 — «걸자마자 최근 딜이 보인다»가 이 탭의 첫 경험.
 * 이미 건 키워드는 뺀다. 계측 keyword_register source=keyword_tab(앱과 같은 값).
 */
export default function RecommendedKeywordChips({
  registered,
  wrap = false,
}: {
  registered: Set<string>;
  /** 키워드가 없을 때(칩이 화면의 본체) — 한 줄로 넘기지 않고 다 보이게 감는다. */
  wrap?: boolean;
}) {
  const { toast } = useToast();
  const promptPushChannel = usePushChannelPrompt();
  const { data } = useQuery(AuthQueries.recommendedKeywords());
  const chips = (data?.recommendedNotificationKeywords ?? [])
    .filter((keyword) => !registered.has(keyword.trim().toLowerCase()))
    .slice(0, MAX_CHIPS);
  const { mutate, isPending } = useUpdateKeyword({
    source: 'keyword_tab',
    onSuccess: ({ keyword }) => {
      toast.success(`'${keyword}' 키워드 알림을 등록했어요.`);
      promptPushChannel(keyword, 'keyword_tab');
    },
  });

  const addMore = (
    <Link
      href={PAGE.MYPAGE_KEYWORD}
      data-track="keyword-tab-register"
      className={cn(text.caption, 'shrink-0 underline underline-offset-2 hover:text-gray-700')}
    >
      {KEYWORD_BOARD_COPY.addMore}
    </Link>
  );

  // 폰은 칩을 한 줄로 넘기고(여러 줄로 감기면 카드보다 칩이 커 보였다), PC 는 감는다. 「직접 입력해서 걸기」는 제목 줄 오른쪽.
  if (chips.length === 0) return addMore;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className={text.caption}>{KEYWORD_BOARD_COPY.recommendedTitle}</p>
        {addMore}
      </div>
      <ul
        className={cn(
          'mt-2 flex gap-2',
          wrap
            ? 'flex-wrap'
            : 'pc:mx-0 pc:flex-wrap pc:px-0 scrollbar-hide -mx-5 overflow-x-auto px-5',
        )}
      >
        {chips.map((keyword) => (
          <li key={keyword} className="shrink-0">
            <button
              type="button"
              disabled={isPending}
              onClick={() => mutate({ keyword, fromRecommendation: true })}
              aria-label={`${keyword} 키워드 알림 등록`}
              className={cn(
                'flex items-center gap-1.5 disabled:opacity-50',
                addChip.box,
                addChip.text,
              )}
            >
              {keyword}
              <span className={addChip.plus}>+</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
