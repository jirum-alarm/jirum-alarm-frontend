'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { cn } from '@/shared/lib/cn';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

import { useUpdateKeyword } from '@/features/mypage/model';

import { deriveKeyword } from '../lib/deriveKeyword';

/**
 * 구매 링크를 누른 직후에만 뜨는 알림 등록 배너.
 *
 * 상세 첫진입 14,917명 중 90.4%가 한 장만 보고 이탈하고, 구매클릭(36.8%)이
 * 서비스와의 마지막 접점이다. 지금은 외부로 내보내고 끝이라 돌아올 이유가 없다.
 * 구매 링크는 target=_blank 라 유저는 이 페이지에 남아 있으므로, 그 순간에
 * "가격 추적해주는 곳"이라는 정체성을 문장이 아니라 기능으로 전달한다.
 *
 * 마이페이지의 키워드 등록(add_keyword_click 27명 = 수요 0)과 다른 실험인 이유는
 * 진입 맥락이다. 저긴 메뉴를 찾아 들어가야 하고, 여긴 구매 직전 맥락에서 원클릭이다.
 *
 * 구매 흐름은 건드리지 않는다 — 클릭을 가로채지 않고 클릭 이후에만 나타난다.
 */

/** 키워드 등록 최소 길이. useKeywordInput 의 MIN_KEYWORD_LENGTH 와 맞춘다. */
const MIN_KEYWORD_LENGTH = 2;

/**
 * GraphQL 에러에서 서버가 준 메시지를 꺼낸다. graphql-request 는 응답 에러를
 * `response.errors[].message` 에 담고, 그 외 예외는 Error.message 에 담는다.
 */
function getErrorMessage(error: unknown): string {
  const gql = error as { response?: { errors?: { message?: string }[] } };
  const fromResponse = gql?.response?.errors?.[0]?.message;
  if (fromResponse) return fromResponse;
  return error instanceof Error ? error.message : '';
}

export default function PostPurchaseKeywordPrompt({
  show,
  title,
  onClose,
  className,
}: {
  show: boolean;
  title: string;
  onClose: () => void;
  className?: string;
}) {
  const { toast } = useToast();
  const { isLoggedIn } = useIsLoggedIn();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();
  const { requestPermission } = useFcmPermission();
  const [done, setDone] = useState(false);

  const { mutate: addNotificationKeyword, isPending } = useUpdateKeyword({
    onSuccess: () => {
      // 등록되면 배너가 사라지는 게 아니라 안내 문구로 바뀐다. 사라지면 등록이 된 건지
      // 눌림이 씹힌 건지 알 수 없다 — 결과를 남겨두는 쪽이 신뢰를 만든다.
      setDone(true);
      requestPermission();
    },
    onError: (error) => {
      // '이미 등록된 키워드'는 사용자 입장에선 실패가 아니라 이미 목적이 달성된 상태다.
      // 제목에서 자동 추출한 키워드라 흔한 브랜드명이면 이미 등록돼 있을 확률이 높은데,
      // 여기서 '저장 실패' 토스트를 띄우면 멀쩡히 알림을 받고 있는데도 고장으로 읽힌다.
      const message = getErrorMessage(error);
      if (message.includes('이미 등록된')) {
        setDone(true);
        return;
      }
      // 나머지(최대 20개 초과 등)는 서버가 준 이유를 그대로 보여준다.
      toast(message || '키워드 저장에 실패했습니다.');
    },
  });

  const keyword = deriveKeyword(title);
  const segments = [...new Intl.Segmenter().segment(keyword)].length;
  const hasKeyword = segments >= MIN_KEYWORD_LENGTH;

  // 이미 등록된 키워드면 권유 자체를 띄우지 않는다. 눌러야 알려주는 것보다 안 보이는 게
  // 낫고, 노출/클릭 지표도 "등록 가능한 경우"만 세게 되어 등록률이 정확해진다.
  //
  // useQuery(useSuspenseQuery 아님) — 배너는 구매 클릭 직후에 떠야 하는데 suspense 면
  // 목록을 기다리느라 노출이 밀린다. 마이페이지와 같은 queryKey 라 캐시를 공유하고,
  // 등록 뮤테이션이 이 키를 invalidate 하므로 따로 갱신할 필요도 없다.
  const { data: keywordData } = useQuery({
    ...AuthQueries.myKeywords({ limit: 20 }),
    enabled: show && isLoggedIn && hasKeyword,
  });

  const alreadyRegistered = (keywordData?.notificationKeywordsByMe ?? []).some(
    // 서버가 저장할 때 toLowerCase() 하므로 비교도 소문자로 맞춘다.
    (item) => item?.keyword?.toLowerCase() === keyword.toLowerCase(),
  );

  // done 이면 alreadyRegistered 를 무시한다. 방금 등록해서 목록에 들어간 것이므로
  // 여기서 숨기면 사용자가 누른 직후 배너가 사라져 등록됐는지 알 수 없다.
  const visible = show && hasKeyword && (done || !alreadyRegistered);

  // 상품이 바뀌면 이전 상품의 완료 상태가 남지 않도록 초기화.
  useEffect(() => {
    setDone(false);
  }, [title]);

  // 클릭만 재면 "안 눌렸다"가 배너 탓인지 노출이 적어서인지 못 가른다. 노출도 같이 보낸다.
  // done 은 제외 — 등록 완료 문구는 새로운 권유 노출이 아니라 같은 배너의 결과 상태라
  // 여기서 세면 노출이 부풀어 등록률(클릭/노출)이 실제보다 낮게 나온다.
  useEffect(() => {
    if (!visible || done || typeof window === 'undefined') return;
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'keyword_prompt_view',
      keyword,
    });
  }, [visible, done, keyword]);

  if (!visible) return null;

  const handleRegister = () => {
    if (typeof window !== 'undefined') {
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
        event: 'keyword_prompt_click',
        keyword,
        // 게스트는 로그인으로 튕기고 등록까지 못 간다. 등록률과 의향을 갈라 보려고 남긴다.
        logged_in: isLoggedIn,
      });
    }

    // 게스트가 트래픽의 97%다. 웹은 로그인 모달, 앱(WebView)은 네이티브 라우팅 —
    // 둘 다 checkAndRedirect 가 처리한다.
    if (
      checkAndRedirect({
        title: '키워드 알림은 로그인이 필요해요',
        description: `로그인하고 '${keyword}' 알림을 받아보세요`,
      })
    )
      return;

    // 이 배너의 문구가 "더 싸지면" 이므로 하락 전용으로 등록한다.
    // 마이페이지에서 직접 입력하는 경로는 기본값(전부 받기)을 그대로 쓴다.
    addNotificationKeyword({ keyword, priceDropOnly: true });
  };

  // 등록 완료 상태. 배경·글자색·크기를 권유 상태와 동일하게 둔다 — 배경까지 바뀌면
  // 같은 배너의 상태 변화가 아니라 다른 컴포넌트가 뜬 것처럼 보인다. 상태가 바뀐 신호는
  // 체크 아이콘 하나로만 준다(색은 accent, 나머지 톤은 그대로).
  if (done) {
    return (
      <div role="status" className={cn('flex items-center gap-x-3 bg-gray-50 py-3', className)}>
        <span
          aria-hidden
          className="bg-secondary-500 flex size-5 shrink-0 items-center justify-center rounded-3xl text-[11px] leading-none font-bold text-white"
        >
          ✓
        </span>
        {/* 권유 상태와 같은 2줄 구조·같은 크기 — 안내 문장은 온전히, 키워드만 줄인다. */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800">알림을 등록했어요</p>
          <p className="mt-1 truncate text-xs text-gray-500">
            &lsquo;{keyword}&rsquo; 새 딜이 나오면 알려드려요
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="알림 안내 닫기"
          className="flex h-11 shrink-0 items-center px-2 text-xs text-gray-400"
        >
          닫기
        </button>
      </div>
    );
  }

  return (
    // 컨테이너 모양은 호출부가 정한다. 모바일은 고정 바 위에 얹히는 띠(border-b, px-5),
    // 데스크톱은 본문 안에 놓이는 카드(rounded, border)라 테두리 규칙이 서로 다르다.
    <div className={cn('flex items-center gap-x-3 bg-gray-50 py-3', className)}>
      <div className="min-w-0 flex-1">
        {/* 375px 에서 텍스트 가용폭은 ~215px 인데 "더 싸지면 알려드릴까요?" 만 ~182px 라
            키워드와 한 줄에 넣으면 키워드가 2자로 잘린다. 줄을 나눠 각자 온전히 보여준다. */}
        <p className="text-sm font-semibold text-gray-800">더 싸지면 알려드릴까요?</p>
        <p className="mt-1 truncate text-xs text-gray-500">
          &lsquo;{keyword}&rsquo; 가격을 지켜볼게요
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-x-1">
        <button
          type="button"
          onClick={handleRegister}
          disabled={isPending}
          className="bg-secondary-500 flex h-11 items-center rounded-lg px-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isPending ? '등록 중' : '알림 받기'}
        </button>
        {/* 터치 타겟 44px 확보 — 글자는 작아도 누를 면적은 손가락 크기여야 한다. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="알림 안내 닫기"
          className="flex h-11 items-center px-2 text-xs text-gray-400"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
