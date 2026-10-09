import {useMutation, useQueryClient} from '@tanstack/react-query';

import {AuthQueries} from '@/entities/auth';
import {AuthService} from '@/shared/api/auth/auth.service';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {handleLoginError, handleLoginSuccess} from './useSocialLogin/lib';

/**
 * 「로그인 없이 둘러보기」 — 게스트 계정(기기 계정)으로 메인에 들어간다.
 *
 * 왜: 앱은 통째로 로그인 화면 뒤에 있었다. 2026-10-09 실측: 푸시 권한까지 준 비로그인 앱 기기
 * 119대(30일 내 신규 104대)가 로그인 화면에서 멈춰 아무것도 못 봤다. 게스트도 키워드·관심사
 * 알림을 받고, 그 기기에서 로그인하면 백엔드가 계정으로 합친다.
 */
export const useGuestLogin = () => {
  const queryClient = useQueryClient();
  const {mutate, isPending} = useMutation({
    mutationFn: AuthService.guestLogin,
    onSuccess: async data => {
      await handleLoginSuccess(
        data.guestLogin.accessToken,
        data.guestLogin.refreshToken,
        {guest: true},
      );
      Analytics.track('guest_start');
      await queryClient.refetchQueries({
        queryKey: AuthQueries.keys.loginByRefreshToken(),
      });
    },
    onError: async () => {
      await handleLoginError('잠시 후 다시 시도해주세요.');
    },
  });

  return {startGuest: () => mutate(), isGuestPending: isPending};
};
