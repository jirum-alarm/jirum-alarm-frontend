import {createContext, useContext} from 'react';

/**
 * 로그인 화면이 창(LoginModalScreen)으로 떴나. 떴으면 「로그인 없이 둘러보기」(게스트 시작) 대신 창을 닫는다 —
 * 이미 게스트로 둘러보던 사람이다.
 */
export const LoginModalContext = createContext<{onClose: () => void} | null>(
  null,
);

export const useLoginModal = () => useContext(LoginModalContext);
