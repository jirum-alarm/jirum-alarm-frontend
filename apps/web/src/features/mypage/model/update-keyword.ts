import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

export const useUpdateKeyword = (options?: {
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
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
      options?.onSuccess?.(variables);
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
        return;
      }
      toast('키워드 저장에 실패했습니다.');
    },
  });
};
