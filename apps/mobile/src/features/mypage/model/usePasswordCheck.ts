import {useMutation} from '@tanstack/react-query';

import {AuthService} from '@/shared/api/auth/auth.service';
import {StorageKey} from '@/shared/constant/storage-key';
import {setAsyncStorage} from '@/shared/lib/persistence';

/**
 * 현재 비밀번호 확인. web `useCurrentPasswordFormViewModel` 과 같이
 * **로그인 뮤테이션을 검사용으로** 쓴다(web 주석: `@FIXME: change to password
 * check api` — 전용 API 가 아직 없다).
 *
 * ★★web 과 한 가지 다르다: **응답 토큰을 저장한다.**
 * 브라우저에서는 로그인 응답이 쿠키를 덮어써 새 토큰이 자동으로 적용됐다.
 * 앱은 토큰을 AsyncStorage 에 들고 있어서, 저장하지 않으면 서버가 로그인 때
 * refresh 토큰을 새로 발급/회전시키는 경우 **손에 든 옛 토큰이 죽는다** —
 * 비밀번호를 바꾸려다 다음 갱신에서 로그아웃되는 모양이 된다.
 * 검사에 성공했으면 그 응답이 가장 새 토큰이므로 그대로 갈아 끼운다.
 */
export function usePasswordCheck({
  email,
  onVerified,
  onFailed,
}: {
  email: string;
  onVerified: () => void;
  onFailed: () => void;
}) {
  return useMutation({
    mutationFn: (password: string) => AuthService.loginUser({email, password}),
    onSuccess: async data => {
      const accessToken = data?.login?.accessToken;
      const refreshToken = data?.login?.refreshToken;
      if (accessToken) {
        await setAsyncStorage(StorageKey.ACCESS_TOKEN, accessToken).catch(
          () => {},
        );
      }
      if (refreshToken) {
        await setAsyncStorage(StorageKey.REFRESH_TOKEN, refreshToken).catch(
          () => {},
        );
      }
      onVerified();
    },
    onError: onFailed,
  });
}
