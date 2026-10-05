import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemeService } from '@/shared/api/notification/theme.service';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { useToast } from '@/shared/ui/common/Toast';

import { ThemeQueries } from '@/entities/notification';

// 묶음(테마) 구독/해지. optimistic update로 클릭 즉시 버튼 상태 반영 후 서버 정합성 맞춤.
// (invalidate만으론 useSuspenseQuery 목록이 즉시 안 바뀌어 "구독 눌러도 그대로"였음)
export const useThemeSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const promptPushChannel = usePushChannelPrompt();

  const key = ThemeQueries.mySubscribedIds().queryKey;

  const optimistic = (themeId: number, subscribe: boolean) => {
    queryClient.setQueryData<number[]>(key, (prev = []) => {
      const set = new Set(prev);
      if (subscribe) set.add(themeId);
      else set.delete(themeId);
      return [...set];
    });
  };

  const {
    mutate: subscribe,
    isPending: isSubscribing,
    variables: subscribingId,
  } = useMutation({
    mutationFn: (themeId: number) => ThemeService.subscribe(themeId),
    onMutate: (themeId) => {
      const prev = queryClient.getQueryData<number[]>(key);
      optimistic(themeId, true);
      return { prev };
    },
    onSuccess: () => {
      // 켠 직후 "그래서 뭐가 오는지"를 한 번 알려준다 — 키워드처럼 딜마다 오는 게 아니라서.
      toast('알림을 켰어요. 반응 좋은 딜만 골라 하루 최대 3건 보내드릴게요.');
      promptPushChannel();
    },
    onError: (_e, _themeId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
      toast('알림 켜기에 실패했어요.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const {
    mutate: unsubscribe,
    isPending: isUnsubscribing,
    variables: unsubscribingId,
  } = useMutation({
    mutationFn: (themeId: number) => ThemeService.unsubscribe(themeId),
    onMutate: (themeId) => {
      const prev = queryClient.getQueryData<number[]>(key);
      optimistic(themeId, false);
      return { prev };
    },
    onError: (_e, _themeId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
      toast('알림 끄기에 실패했어요.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  // 목록에서 버튼마다 isPending 을 공유하면 하나를 눌렀을 때 전부 disabled 로 깜빡인다 → 누른 것만.
  const pendingThemeId = isSubscribing
    ? subscribingId
    : isUnsubscribing
      ? unsubscribingId
      : undefined;

  return {
    subscribe,
    unsubscribe,
    isPending: isSubscribing || isUnsubscribing,
    isPendingFor: (themeId: number) => pendingThemeId === themeId,
  };
};
