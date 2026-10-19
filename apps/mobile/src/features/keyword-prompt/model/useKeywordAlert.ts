import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {MyPageService} from '@/shared/api/mypage';
import {
  trackKeywordRegister,
  type KeywordRegisterSource,
} from '@/shared/lib/analytics/keyword-tracking';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';
import {showToast} from '@/shared/lib/feedback';
import {isValidKeyword} from '@/entities/mypage/lib/validation';

import {
  invalidateMyKeywords,
  normalizeKeyword,
  openKeywordSettings,
  useMyKeywordSet,
} from '@/entities/mypage/model/myKeywords';

/**
 * 이 단어로 **한 번에** 알림을 건다 — 검색 결과 위 한 줄·결과 없음 버튼(KeywordAlertButton)·키워드 허브 버튼이 같이 쓴다.
 * web `useSearchKeywordAlert` 와 같은 역할. 게스트도 첫 실행에 계정이 자동으로 생겨 그대로 등록된다.
 *
 * - 누르는 즉시 "알림 받는 중" 으로 바꾸고(낙관적), 실패하면 되돌린다.
 * - 다른 화면에서 이미 등록했으면(서버 "이미 등록된") 실패가 아니다 — 켜진 상태로 맞춘다.
 * - canRegister=false(2~20자 밖)면 버튼을 내밀었다가 거절하느니 안 보인다.
 */
export function useKeywordAlert(
  keyword: string,
  source: KeywordRegisterSource,
) {
  const queryClient = useQueryClient();
  const registered = useMyKeywordSet();
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const trimmed = keyword.trim();
  const isOn =
    registered.has(normalizeKeyword(trimmed)) || optimistic === trimmed;

  const {mutate} = useMutation({
    mutationFn: () => MyPageService.addKeyword({keyword: trimmed}),
    onSuccess: () => {
      trackKeywordRegister(source, trimmed);
      // 등록한 뒤 갈 곳이 없던 자리 — 조건(제외 단어·가격)을 바로 손볼 수 있게 키워드 화면으로 잇는다.
      showToast.success(`'${trimmed}' 새 핫딜이 올라오면 알려드릴게요.`, {
        action: {label: '보기', onPress: openKeywordSettings},
      });
      requestPushPermissionIfNeeded();
      return invalidateMyKeywords(queryClient);
    },
    onError: (error: unknown) => {
      setOptimistic(null);
      const message = error instanceof Error ? error.message : '';
      if (message.includes('이미 등록된')) {
        invalidateMyKeywords(queryClient);
        return;
      }
      showToast.error(message || '알림을 등록하지 못했어요.');
    },
  });

  const register = () => {
    if (isOn) return;
    setOptimistic(trimmed);
    mutate();
  };

  return {trimmed, isOn, canRegister: isValidKeyword(trimmed), register};
}
