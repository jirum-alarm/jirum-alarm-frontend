import { Metadata } from 'next';

import HelpArticle from '@/app/(desktop-ready)/help/HelpArticle';

import { checkDevice } from '@/shared/actions/agent';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

/**
 * PC 마이페이지 왼쪽 메뉴 「사용법·자주 묻는 질문」 — /help 와 같은 본문을 마이페이지 틀(MyPageShell) 안에서 연다.
 * /help 로 보내면 왼쪽 메뉴가 사라져 돌아가기 불편했다(2026-10-23 사용자). 정본은 /help((mobile) 그룹은 noindex, canonical 로 가리킨다).
 * 모바일 목록과 앱은 그대로 /help 를 연다(틀이 없으니 같은 화면).
 */
export const metadata: Metadata = {
  title: '사용법 · 자주 묻는 질문',
  alternates: { canonical: `${METADATA_SERVICE_URL}/help` },
};

export default async function MyPageHelpPage() {
  const { isJirumAlarmApp } = await checkDevice();
  return <HelpArticle isJirumAlarmApp={isJirumAlarmApp} embedded />;
}
