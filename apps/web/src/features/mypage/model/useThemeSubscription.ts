import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemeService } from '@/shared/api/notification/theme.service';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { useToast } from '@/shared/ui/common/Toast';

import { ThemeQueries } from '@/entities/notification';

// 묶음(테마) 구독/해지. optimistic update로 클릭 즉시 버튼 상태 반영 후 서버 정합성 맞춤.
// (invalidate만으론 useSuspenseQuery 목록이 즉시 안 바뀌어 "구독 눌러도 그대로"였음)
export const useThemeSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { requestPermission } = useFcmPermission();

  const key = ThemeQueries.mySubscribedIds().queryKey;

  const optimistic = (themeId: number, subscribe: boolean) => {
    queryClient.setQueryData<number[]>(key, (prev = []) => {
      const set = new Set(prev);
      if (subscribe) set.add(themeId);
      else set.delete(themeId);
      return [...set];
    });
  };

  const { mutate: subscribe, isPending: isSubscribing } = useMutation({
    mutationFn: (themeId: number) => ThemeService.subscribe(themeId),
    onMutate: (themeId) => {
      const prev = queryClient.getQueryData<number[]>(key);
      optimistic(themeId, true);
      return { prev };
    },
    onSuccess: () => requestPermission(),
    onError: (_e, _themeId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
      toast('묶음 구독에 실패했습니다.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const { mutate: unsubscribe, isPending: isUnsubscribing } = useMutation({
    mutationFn: (themeId: number) => ThemeService.unsubscribe(themeId),
    onMutate: (themeId) => {
      const prev = queryClient.getQueryData<number[]>(key);
      optimistic(themeId, false);
      return { prev };
    },
    onError: (_e, _themeId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
      toast('구독 해지에 실패했습니다.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return { subscribe, unsubscribe, isPending: isSubscribing || isUnsubscribing };
};
