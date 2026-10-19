import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';

import AuthStackNavigator from '@/navigations/stack/AuthNavigator';
import {useAuth} from '@/entities/auth/useAuth';

import {LoginModalContext} from './login-modal-context';

/**
 * 게스트가 회원 기능(찜·추천·댓글·신고·내정보 계정 메뉴)을 누르면 지금 화면 위에 뜨는 로그인 창.
 * 안은 로그인 첫 화면과 같은 AuthNavigator(소셜·이메일)다.
 *
 * 로그인되면(회원이 되면) 스스로 닫힌다 — 뒤 화면은 그대로라 usePendingAction 이 누르던 동작(찜 등)을 이어서 한다.
 * 게스트 때 받아 둔 내 정보·알림·찜 상태는 회원 것으로 다시 받는다.
 */
export default function LoginModalScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {isMember} = useAuth();

  useEffect(() => {
    if (!isMember) return;
    void queryClient.invalidateQueries();
    if (navigation.canGoBack()) navigation.goBack();
  }, [isMember, navigation, queryClient]);

  return (
    <LoginModalContext.Provider value={{onClose: () => navigation.goBack()}}>
      <AuthStackNavigator />
    </LoginModalContext.Provider>
  );
}
