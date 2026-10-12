import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { AuthService, type NotificationIntent } from '@/shared/api/auth';
import { getGraphqlErrorMessage } from '@/shared/lib/graphql-error';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { useToast } from '@/shared/ui/common/Toast';

import { useUpdateKeyword } from './update-keyword';

const MIN_TEXT = 2;
const MAX_TEXT = 100;

/**
 * 「문장으로 알림 만들기」 — 문장을 서버(Haiku 5.5)가 키워드·가격 범위·제외 단어로 바꾸고, 지난 30일이면 몇 건
 * 왔을지 보여 준 뒤 그대로 등록한다. 키워드 후보는 서버가 지난 딜에 실제로 걸린 것 중 가장 구체적인 것을 골라 주고,
 * 사용자가 다른 후보로 바꿀 수 있다(crawling notification/util/notification-intent.ts).
 */
export const useSentenceAlert = () => {
  const { toast } = useToast();
  const promptPushChannel = usePushChannelPrompt();
  const [text, setText] = useState('');
  // undefined = 아직 안 물어봄, null = 상품을 못 찾음
  const [intent, setIntent] = useState<NotificationIntent | null | undefined>(undefined);
  const [keyword, setKeyword] = useState('');

  const reset = () => {
    setText('');
    setIntent(undefined);
    setKeyword('');
  };

  const parse = useMutation({
    mutationFn: AuthService.parseNotificationIntent,
    onSuccess: (result) => {
      setIntent(result);
      setKeyword(result?.keyword ?? '');
    },
    onError: (error) => toast.error(getGraphqlErrorMessage(error) || '문장을 읽지 못했어요.'),
  });

  const register = useUpdateKeyword({
    source: 'mypage_sentence',
    onSuccess: ({ keyword: registered }) => {
      toast.success(`'${registered}' 키워드 알림을 등록했어요.`);
      reset();
      promptPushChannel(registered);
    },
    onError: (error) => toast.error(getGraphqlErrorMessage(error) || '키워드 저장에 실패했습니다.'),
  });

  const trimmed = text.trim();
  const canParse = trimmed.length >= MIN_TEXT && trimmed.length <= MAX_TEXT && !parse.isPending;

  return {
    text,
    setText: (value: string) => {
      setText(value.slice(0, MAX_TEXT));
      setIntent(undefined);
    },
    maxLength: MAX_TEXT,
    canParse,
    parse: () => canParse && parse.mutate({ text: trimmed }),
    isParsing: parse.isPending,
    intent,
    keyword,
    setKeyword,
    register: () => {
      if (!intent || !keyword) return;
      register.mutate({
        keyword,
        minPrice: intent.minPrice,
        maxPrice: intent.maxPrice,
        excludeKeywords: intent.excludeKeywords,
      });
    },
    isRegistering: register.isPending,
    reset,
  };
};
