'use client';

import { createContext, useContext } from 'react';

/**
 * "이 질문을 지금 대화에 보내라" 통로.
 *
 * 왜 context 인가: 되묻기 칩은 `Chat → AnswerBubble → Block(switch) → FollowUp` 밑에 있다.
 * 콜백을 4단계로 내리려면 중간 컴포넌트 전부가 자기와 무관한 prop 을 받아야 한다.
 * 블록 렌더러는 블록 한 종류만 알면 된다는 원칙(answer.ts 주석)을 깨지 않으려고 context 를 쓴다.
 *
 * null 이면 "대화 밖"(홈 등)이라 칩이 링크로 폴백한다 — 그 화면엔 보낼 대화가 없다.
 */
export const AskContext = createContext<((question: string) => void) | null>(null);

export const useAsk = () => useContext(AskContext);
