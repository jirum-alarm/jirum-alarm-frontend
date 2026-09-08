import {useMutation, useQueryClient} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import {CategoryQueries} from '@/entities/category/category.queries';
import {MyPageService} from '@/shared/api/mypage';
import {showToast} from '@/shared/lib/feedback';

import {useLogout} from './useLogout';

/**
 * 프로필 저장 3종 + 비밀번호 + 탈퇴. web `features/mypage/model/update-*.ts`.
 *
 * ★web 은 성공 뒤 `useGoBack()`/`router.push` 를 훅 안에서 직접 부른다.
 * 여기서는 `onDone` 으로 받아 화면이 `navigation.goBack()` 을 하게 둔다 —
 * 훅이 네비게이션을 쥐면 같은 훅을 다른 화면에서 못 쓴다(비밀번호는 2단계라
 * 뒤로가기 의미가 다르다).
 */

function useProfileMutation({
  successMessage,
  errorMessage,
  onDone,
  invalidateCategories = false,
}: {
  successMessage: string;
  errorMessage: string;
  onDone?: () => void;
  invalidateCategories?: boolean;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MyPageService.updateMyProfile,
    onSuccess: () => {
      showToast.info(successMessage);
      queryClient.invalidateQueries({queryKey: MyPageQueries.keys.me()});
      if (invalidateCategories) {
        // 관심 카테고리는 발견 탭의 카테고리 칩 줄에도 쓰인다(categoriesForUser).
        // web 도 같이 무효화한다 — 안 하면 24시간 staleTime 때문에 칩이 안 바뀐다.
        queryClient.invalidateQueries({
          queryKey: CategoryQueries.keys.all,
        });
      }
      onDone?.();
    },
    onError: () => showToast.info(errorMessage),
  });
}

export function useUpdateNickname(onDone?: () => void) {
  return useProfileMutation({
    successMessage: '닉네임이 저장됐어요',
    errorMessage: '닉네임 저장중 에러가 발생했어요',
    onDone,
  });
}

export function useUpdatePersonal(onDone?: () => void) {
  return useProfileMutation({
    successMessage: '개인정보가 저장됐어요.',
    errorMessage: '개인정보 저장중 에러가 발생했어요.',
    onDone,
  });
}

export function useUpdateCategories(onDone?: () => void) {
  return useProfileMutation({
    successMessage: '관심 카테고리가 저장됐어요.',
    errorMessage: '관심 카테고리 저장중 에러가 발생했어요.',
    onDone,
    invalidateCategories: true,
  });
}

export function useUpdatePassword(onDone?: () => void) {
  return useMutation({
    mutationFn: MyPageService.updateMyPassword,
    onSuccess: () => {
      showToast.info('비밀번호 변경이 완료됐어요.');
      onDone?.();
    },
    onError: () => showToast.info('비밀번호 변경중 에러가 발생했어요.'),
  });
}

/**
 * 회원탈퇴. web `DeleteAccount` 와 같이 **성공 뒤 로그아웃 경로를 그대로 탄다** —
 * 서버에서 계정이 지워졌으니 토큰·쿠키·배지를 남겨두면 앱은 로그인 상태처럼
 * 굴다가 모든 요청이 401 로 죽는다(useLogout 주석 참조).
 */
export function useWithdraw() {
  const logout = useLogout();
  return useMutation({
    mutationFn: MyPageService.withdraw,
    onSuccess: () => logout(),
    onError: () => showToast.info('회원탈퇴에 실패했어요'),
  });
}
