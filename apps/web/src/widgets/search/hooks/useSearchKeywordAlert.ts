'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { PAGE } from '@/shared/config/page';
import useAlertSession from '@/shared/hooks/useAlertSession';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { pushDataLayer } from '@/shared/lib/data-layer';
import { getGraphqlErrorMessage } from '@/shared/lib/graphql-error';
import { PendingActionType, usePendingAction } from '@/shared/lib/pending-action';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

import { useUpdateKeyword } from '@/features/mypage/model';

/** 키워드 알림 길이 규칙(자소 기준). 마이페이지 useKeywordInput·앱 isValidKeyword 와 같은 2~20. */
const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORD_LENGTH = 20;

export const isRegistrableKeyword = (keyword: string) => {
  const length = [...new Intl.Segmenter().segment(keyword.trim())].length;
  return length >= MIN_KEYWORD_LENGTH && length <= MAX_KEYWORD_LENGTH;
};

export { pushDataLayer };

/**
 * 검색한 그 단어로 알림을 거는 로직 — 결과 위 한 줄(search_bar)과 0건 화면 버튼(search_no_result)이 같이 쓴다.
 * 앱 features/keyword-prompt/ui/KeywordAlertButton 과 같은 규칙: 이미 등록했으면 "받는 중", 2~20자 밖이면 못 건다.
 *
 * 비로그인은 ensureAlertSession 이 게스트로 바로 진행시키고(웹), 로그인으로 넘어가면 pendingAction 으로
 * 돌아와 이어서 등록한다. 두 자리는 동시에 마운트되지 않으므로(결과 있음/없음) pendingAction 을 서로 뺏지 않는다.
 */
export const useSearchKeywordAlert = ({
  keyword,
  source,
}: {
  keyword: string;
  /** 키워드 허브(/keywords/{slug})·모델 페이지(/deals/{slug})의 알림 버튼도 같은 규칙으로 쓴다. */
  source: 'search_bar' | 'search_no_result' | 'keyword_hub' | 'model_page';
}) => {
  const router = useMyRouter();
  const { toast } = useToast();
  const { isLoggedIn } = useIsLoggedIn();
  const { ensureAlertSession, canUseAlerts } = useAlertSession();
  const promptPushChannel = usePushChannelPrompt();

  const trimmed = keyword.trim();
  const canRegister = isRegistrableKeyword(trimmed);

  // 누른 직후 목록 재조회 전까지도 "받는 중"으로 보이게 — 사라지면 눌렸는지 알 수 없다.
  const [doneKeyword, setDoneKeyword] = useState<string | null>(null);

  // 마이페이지·상세 권유와 같은 queryKey 라 캐시를 공유하고, 등록 뮤테이션이 이 키를 무효화한다.
  const { data: keywordData } = useQuery({
    ...AuthQueries.myKeywords({ limit: 20 }),
    enabled: canUseAlerts && canRegister,
  });
  // 서버는 소문자로 저장한다 — 비교도 소문자로.
  const alreadyRegistered = (keywordData?.notificationKeywordsByMe ?? []).some(
    (item) => item?.keyword?.toLowerCase() === trimmed.toLowerCase(),
  );
  const isOn = alreadyRegistered || doneKeyword === trimmed;

  const { mutate: addKeyword, isPending } = useUpdateKeyword({
    source,
    onSuccess: ({ keyword: added }) => {
      setDoneKeyword(added);
      toast.success(`'${added}' 알림을 등록했어요.`, {
        action: { label: '보기', onClick: () => router.push(PAGE.MYPAGE_KEYWORD) },
      });
      promptPushChannel(added);
    },
    onError: (error) => {
      const message = getGraphqlErrorMessage(error);
      // 다른 화면에서 이미 걸었다면 실패가 아니다 — 켜진 상태로 맞춘다.
      if (message.includes('이미 등록된')) {
        setDoneKeyword(trimmed);
        return;
      }
      toast.error(message || '키워드 저장에 실패했습니다.');
    },
  });

  // 게스트가 눌러 로그인하고 돌아왔으면 그 검색어를 이어서 등록한다.
  usePendingAction<string>(PendingActionType.NOTIFICATION_KEYWORD_ADD, (pending) => {
    if (pending) addKeyword({ keyword: pending });
  });

  /** 2~20자 검색어를 그대로 등록한다. 로그인 왕복이 필요하면 false(돌아와서 이어서 등록). */
  const register = async () => {
    if (!canRegister || isOn || isPending) return;
    // 비로그인의 "막힌 알림 수요" 측정(게이트 직전) — 0건 화면에서 쓰던 이벤트를 결과 위 한 줄에도.
    if (!isLoggedIn) pushDataLayer({ event: 'keyword_intent', keyword: trimmed, source });
    if (
      !(await ensureAlertSession(
        {
          title: '키워드 알림은 로그인이 필요해요',
          description: `로그인하고 '${trimmed}' 알림을 받아보세요`,
        },
        { type: PendingActionType.NOTIFICATION_KEYWORD_ADD, payload: trimmed },
      ))
    )
      return;
    addKeyword({ keyword: trimmed });
  };

  return { trimmed, canRegister, isOn, isPending, isLoggedIn, register, ensureAlertSession };
};
