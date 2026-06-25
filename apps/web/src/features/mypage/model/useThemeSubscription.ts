import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemeService } from '@/shared/api/notification/theme.service';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { useToast } from '@/shared/ui/common/Toast';

import { ThemeQueries } from '@/entities/notification';

// 묶음(테마) 구독/해지. 구독 시 FCM 권한 요청(키워드 등록과 동일 — 알림 받으려면 필요).
export const useThemeSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { requestPermission } = useFcmPermission();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ThemeQueries.mySubscribedIds().queryKey });

  const { mutate: subscribe, isPending: isSubscribing } = useMutation({
    mutationFn: (themeId: number) => ThemeService.subscribe(themeId),
    onSuccess: () => {
      invalidate();
      requestPermission();
    },
    onError: () => toast('묶음 구독에 실패했습니다.'),
  });

  const { mutate: unsubscribe, isPending: isUnsubscribing } = useMutation({
    mutationFn: (themeId: number) => ThemeService.unsubscribe(themeId),
    onSuccess: invalidate,
    onError: () => toast('구독 해지에 실패했습니다.'),
  });

  return { subscribe, unsubscribe, isPending: isSubscribing || isUnsubscribing };
};
