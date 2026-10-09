import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KeywordSettingService } from '@/shared/api/keyword';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

type KeywordOptions = {
  id: number;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
  /** 바뀌었을 때만 넘긴다 — 켤 때마다 서버가 기준가를 다시 잡을 수 있어서 같은 값은 다시 보내지 않는다. */
  priceDropOnly?: boolean;
};

/** 키워드 알림 설정(받을 딜·가격 범위·제외 단어)을 저장 한 번으로. 서버는 뮤테이션이 따로라 병렬 호출. */
export const useUpdateKeywordOptions = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, excludeKeywords, minPrice, maxPrice, priceDropOnly }: KeywordOptions) =>
      Promise.all([
        KeywordSettingService.updateExcludeKeywords({ id, excludeKeywords }),
        KeywordSettingService.updatePriceRange({ id, minPrice, maxPrice }),
        priceDropOnly !== undefined &&
          KeywordSettingService.updatePriceDropOnly({ id, priceDropOnly }),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
      toast.success('알림 설정을 저장했어요.');
      onSuccess?.();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
      toast.error(
        '알림 설정 저장에 실패했어요. 최소 가격이 최대 가격보다 크지 않은지 확인해 주세요.',
      );
    },
  });
};
