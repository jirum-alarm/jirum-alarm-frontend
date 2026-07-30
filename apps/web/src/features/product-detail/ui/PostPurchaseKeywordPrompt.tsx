'use client';

import { useEffect, useState } from 'react';

import { PAGE } from '@/shared/config/page';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { useToast } from '@/shared/ui/common/Toast';

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

export default function PostPurchaseKeywordPrompt({
  show,
  title,
  onClose,
}: {
  show: boolean;
  title: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { isLoggedIn } = useIsLoggedIn();
  const router = useMyRouter();
  const { requestPermission } = useFcmPermission();
  const [done, setDone] = useState(false);

  const { mutate: addNotificationKeyword, isPending } = useUpdateKeyword({
    onSuccess: () => {
      setDone(true);
      toast(<>이제 &lsquo;{keyword}&rsquo; 새 딜이 올라오면 알려드릴게요.</>);
      requestPermission();
    },
  });

  const keyword = deriveKeyword(title);
  const segments = [...new Intl.Segmenter().segment(keyword)].length;
  const visible = show && !done && segments >= MIN_KEYWORD_LENGTH;

  // 상품이 바뀌면 이전 상품의 완료 상태가 남지 않도록 초기화.
  useEffect(() => {
    setDone(false);
  }, [title]);

  // 클릭만 재면 "안 눌렸다"가 배너 탓인지 노출이 적어서인지 못 가른다. 노출도 같이 보낸다.
  useEffect(() => {
    if (!visible || typeof window === 'undefined') return;
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'keyword_prompt_view',
      keyword,
    });
  }, [visible, keyword]);

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

    // 게스트가 트래픽의 97%다. 로그인으로 보내되 돌아올 곳을 남긴다.
    if (!isLoggedIn) {
      router.push(PAGE.LOGIN);
      return;
    }
    addNotificationKeyword({ keyword });
  };

  return (
    <div className="flex items-start gap-x-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800">
          &lsquo;{keyword}&rsquo; 더 싸지면 알려드릴까요?
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          지름알림이 커뮤니티 핫딜을 계속 지켜보고 있어요.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-x-2">
        <button
          type="button"
          onClick={handleRegister}
          disabled={isPending}
          className="bg-secondary-500 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isPending ? '등록 중' : '알림 받기'}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="알림 안내 닫기"
          className="px-2 py-2 text-xs text-gray-400"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
