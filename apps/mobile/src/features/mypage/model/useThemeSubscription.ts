import {useMutation, useQueryClient} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import {ThemeService} from '@/shared/api/theme';
import {showToast} from '@/shared/lib/feedback';

/**
 * 묶음(테마) 구독/해지. web `features/mypage/model/useThemeSubscription.ts`.
 *
 * 낙관적 업데이트를 그대로 옮긴다 — 무효화만 하면 목록이 즉시 안 바뀌어
 * "구독 눌러도 그대로"였다는 web 주석의 사고가 앱에서도 똑같이 난다.
 *
 * ★web 의 `onSuccess: requestPermission()`(알림 권한 요청)은 옮기지 않는다.
 * 앱은 진입 때 `useFCMTokenManager` 가 이미 요청·등록한다(useKeywordViewModel
 * 주석과 같은 이유).
 */
export function useThemeSubscription() {
  const queryClient = useQueryClient();
  const key = ThemeQueries.keys.mySubscribed();

  const optimistic = (themeId: number, subscribe: boolean) => {
    queryClient.setQueryData<number[]>(key, (prev = []) => {
      const set = new Set(prev);
      if (subscribe) set.add(themeId);
      else set.delete(themeId);
      return [...set];
    });
  };

  const snapshot = () => ({prev: queryClient.getQueryData<number[]>(key)});

  const rollback = (context: {prev?: number[]} | undefined) => {
    if (context?.prev) queryClient.setQueryData(key, context.prev);
  };

  const {mutate: subscribe, isPending: isSubscribing} = useMutation({
    mutationFn: (themeId: number) => ThemeService.subscribe(themeId),
    onMutate: themeId => {
      const context = snapshot();
      optimistic(themeId, true);
      return context;
    },
    onError: (_err, _themeId, context) => {
      rollback(context);
      showToast.info('묶음 구독에 실패했습니다.');
    },
    onSettled: () => queryClient.invalidateQueries({queryKey: key}),
  });

  const {mutate: unsubscribe, isPending: isUnsubscribing} = useMutation({
    mutationFn: (themeId: number) => ThemeService.unsubscribe(themeId),
    onMutate: themeId => {
      const context = snapshot();
      optimistic(themeId, false);
      return context;
    },
    onError: (_err, _themeId, context) => {
      rollback(context);
      showToast.info('구독 해지에 실패했습니다.');
    },
    onSettled: () => queryClient.invalidateQueries({queryKey: key}),
  });

  return {
    subscribe,
    unsubscribe,
    isPending: isSubscribing || isUnsubscribing,
  };
}
