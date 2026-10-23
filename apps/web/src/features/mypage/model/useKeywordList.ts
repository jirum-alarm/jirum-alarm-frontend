import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

import { useRemoveKeyword } from './remove-keyword';

export const useKeywordList = () => {
  const {
    data: { notificationKeywordsByMe },
  } = useSuspenseQuery(AuthQueries.myKeywords({ limit: 20 }));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: removeNotificationKeyword } = useRemoveKeyword();
  // 확인 창 대신 되돌리기(앱 useKeywordViewModel 과 같은 흐름) — 원탭 삭제는 빠르지만 잘못 누르면 걸어 둔 조건까지 날아간다.
  // 되살릴 땐 가격·제외어 조건도 그대로 다시 건다. 새 id 로 만들어지지만 사용자에겐 같은 키워드다.
  const onDeleteKeyword = (id: string) => {
    const removed = notificationKeywordsByMe.find((k) => k.id === id);
    removeNotificationKeyword(
      { id: Number(id) },
      {
        onSuccess: () => {
          if (!removed) return;
          toast.success(`'${removed.keyword}' 키워드를 삭제했어요.`, {
            action: {
              label: '되돌리기',
              onClick: () => {
                AuthService.updateKeyword({
                  keyword: removed.keyword,
                  priceDropOnly: removed.priceDropOnly ?? false,
                  minPrice: removed.minPrice,
                  maxPrice: removed.maxPrice,
                  excludeKeywords: removed.excludeKeywords ?? undefined,
                })
                  .catch(() => toast.error('되돌리지 못했어요.'))
                  .finally(() =>
                    queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() }),
                  );
              },
            },
          });
        },
      },
    );
  };
  return { notificationKeywordsByMe, onDeleteKeyword };
};
