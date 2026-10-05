import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

/**
 * 키워드 알림 등록 위치 — GA4 `keyword_register` 의 source.
 * 앱 `shared/lib/analytics/keyword-tracking.ts` 와 값이 한 글자도 다르면 안 된다(웹·앱 합산).
 */
export type KeywordRegisterSource =
  | 'mypage'
  | 'home_recommend'
  | 'post_purchase'
  | 'signup_complete'; // 가입 완료 화면(웹만)

export const useUpdateKeyword = (options: {
  source: KeywordRegisterSource;
  /** 등록한 값을 받는다 — 성공 후 "어디로 받을까요" 시트에 키워드를 띄우려고. */
  onSuccess?: (variables: Parameters<typeof AuthService.updateKeyword>[0]) => void;
  /**
   * 직접 에러를 처리하고 싶을 때 넘긴다. 넘기면 기본 토스트('키워드 저장에 실패했습니다.')는
   * 뜨지 않는다 — 서버는 '이미 등록된 키워드', '최대 20개 초과' 처럼 구체적인 이유를
   * 주는데 기본 토스트가 그걸 전부 뭉개기 때문이다. 안 넘기면 기존 동작 그대로.
   */
  onError?: (error: unknown) => void;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.updateKeyword,
    onSuccess: (_data, variables) => {
      // 서비스 핵심 행동. 웹 계측은 GTM 경유(dataLayer customEvent 트리거).
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
        event: 'keyword_register',
        source: options.source,
        keyword: variables.keyword,
      });
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
      options.onSuccess?.(variables);
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
        return;
      }
      toast('키워드 저장에 실패했습니다.');
    },
  });
};
