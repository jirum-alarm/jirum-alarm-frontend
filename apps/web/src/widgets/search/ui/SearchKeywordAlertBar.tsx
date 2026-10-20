'use client';

import { SEARCH_ALERT_BAR_COPY, SEARCH_BAR_SOURCE } from '@jirum/domain/search';
import { useEffect } from 'react';

import { pushDataLayer, useSearchKeywordAlert } from '../hooks/useSearchKeywordAlert';

/**
 * 검색 결과 위 한 줄 — "'X' 새 핫딜, 놓치지 마세요 [알림 받기]".
 *
 * 웹은 0건 화면에만 알림 등록이 있어서, 결과가 있는 검색(대부분)에선 검색한 단어로 알림을 걸 길이 없었다
 * (검색 뒤 같은 검색어 등록 4일간 앱 13건·웹 0건, 2026-10-13). 앱 SearchResults 의 KeywordAlertButton(bar)과 같은 문구·규칙.
 * 계측: keyword_register source=search_bar, 노출·클릭은 GTM 에 태그가 있는 keyword_prompt_view/click(placement=search_bar).
 */
export default function SearchKeywordAlertBar({ keyword }: { keyword: string }) {
  const { trimmed, canRegister, isOn, isPending, register } = useSearchKeywordAlert({
    keyword,
    source: SEARCH_BAR_SOURCE,
  });

  const visible = canRegister && !isOn;
  useEffect(() => {
    if (!visible) return;
    pushDataLayer({ event: 'keyword_prompt_view', keyword: trimmed, placement: 'search_bar' });
  }, [visible, trimmed]);

  // 2~20자 밖이면 키워드로 못 건다 — 내밀었다가 거절하느니 안 보인다(앱과 같다).
  if (!canRegister) return null;

  const handleClick = () => {
    pushDataLayer({ event: 'keyword_prompt_click', keyword: trimmed, placement: 'search_bar' });
    register();
  };

  return (
    <div className="mb-3 flex items-center gap-x-3 rounded-xl bg-gray-50 py-2 pr-2 pl-4">
      <p className="min-w-0 flex-1 truncate text-sm text-gray-700">
        <span className="font-semibold text-gray-900">&lsquo;{trimmed}&rsquo;</span>
        {isOn ? SEARCH_ALERT_BAR_COPY.on : SEARCH_ALERT_BAR_COPY.off}
      </p>
      {isOn ? (
        <span
          role="status"
          className="text-primary-800 flex h-9 shrink-0 items-center px-3 text-sm font-semibold"
        >
          받는 중
        </span>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-label={`${trimmed} 새 핫딜 알림 받기`}
          className="text-primary-500 bg-fixed-800 flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? '등록 중' : '알림 받기'}
        </button>
      )}
    </div>
  );
}
