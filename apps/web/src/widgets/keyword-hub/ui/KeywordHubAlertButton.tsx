'use client';

import { useEffect } from 'react';

import { pushDataLayer, useSearchKeywordAlert } from '@/widgets/search/hooks/useSearchKeywordAlert';

/**
 * 허브 머리의 알림 버튼 — 누르면 그 자리에서 이 키워드로 알림을 건다.
 *
 * 예전엔 마이페이지 키워드 화면으로 보내기만 해서 키워드를 다시 쳐야 했다. 허브 목록은 알림 구독 상위 키워드라
 * (2026-10-14 구독 상위 50 중 26개) 허브에 온 사람이 알림으로 넘어가는 비율이 이 페이지의 존재 이유에 가장 가깝다.
 * 검색 결과 위 한 줄과 같은 훅(게스트 → 로그인 왕복 뒤 이어서 등록, 이미 등록이면 "받는 중").
 * 계측: keyword_register source=keyword_hub, keyword_prompt_view/click placement=keyword_hub.
 */
export default function KeywordHubAlertButton({ keyword }: { keyword: string }) {
  const { trimmed, canRegister, isOn, isPending, register } = useSearchKeywordAlert({
    keyword,
    source: 'keyword_hub',
  });

  const visible = canRegister && !isOn;
  useEffect(() => {
    if (!visible) return;
    pushDataLayer({ event: 'keyword_prompt_view', keyword: trimmed, placement: 'keyword_hub' });
  }, [visible, trimmed]);

  if (!canRegister) return null;

  if (isOn) {
    return (
      <span
        role="status"
        className="text-primary-800 mt-3 inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold"
      >
        ‘{trimmed}’ 알림 받는 중
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        pushDataLayer({
          event: 'keyword_prompt_click',
          keyword: trimmed,
          placement: 'keyword_hub',
        });
        register();
      }}
      disabled={isPending}
      className="mt-3 inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {isPending ? '등록 중' : `‘${trimmed}’ 핫딜 알림 받기`}
    </button>
  );
}
