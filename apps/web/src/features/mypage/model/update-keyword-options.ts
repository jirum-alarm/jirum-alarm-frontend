import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KeywordSettingService } from '@/shared/api/keyword';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

type KeywordOptions = {
  id: number;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
};

/** 키워드별 제외 단어 + 가격 범위를 한 번에 저장한다(서버는 뮤테이션이 둘이라 병렬 호출). */
export const useUpdateKeywordOptions = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, excludeKeywords, minPrice, maxPrice }: KeywordOptions) =>
      Promise.all([
        KeywordSettingService.updateExcludeKeywords({ id, excludeKeywords }),
        KeywordSettingService.updatePriceRange({ id, minPrice, maxPrice }),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
      toast('알림 조건을 저장했어요.');
      onSuccess?.();
    },
    onError: () => {
      toast('알림 조건 저장에 실패했습니다. 최소 가격이 최대 가격보다 크지 않은지 확인해 주세요.');
    },
  });
};
