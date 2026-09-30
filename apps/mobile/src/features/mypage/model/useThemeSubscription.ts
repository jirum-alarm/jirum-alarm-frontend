import {useMutation, useQueryClient} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import {ThemeService} from '@/shared/api/theme';
import {showToast} from '@/shared/lib/feedback';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';

/**
 * 묶음(테마) 구독/해지. web `features/mypage/model/useThemeSubscription.ts`.
 *
 * 낙관적 업데이트를 그대로 옮긴다 — 무효화만 하면 목록이 즉시 안 바뀌어
 * "구독 눌러도 그대로"였다는 web 주석의 사고가 앱에서도 똑같이 난다.
 *
 * 구독 성공 뒤 알림 권한을 확인한다(web `onSuccess: requestPermission()` 과 같은 자리).
 * 예전엔 "앱 진입 때 이미 요청한다"며 뺐는데 그 전제가 틀렸다 — push-permission.ts 가
 * 적어 두었듯 Android 13+ 는 진입 때 POST_NOTIFICATIONS 를 묻지 않는다. 그래서 구독해도
 * 알림이 안 오는 사람이 생겼다. 거부 상태면 설정 안내까지 이 함수가 한다.
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
      showToast.info('관심사 알림을 켜지 못했어요.');
    },
    onSuccess: () => requestPushPermissionIfNeeded(),
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
      showToast.info('관심사 알림을 끄지 못했어요.');
    },
    onSettled: () => queryClient.invalidateQueries({queryKey: key}),
  });

  return {
    subscribe,
    unsubscribe,
    isPending: isSubscribing || isUnsubscribing,
  };
}
