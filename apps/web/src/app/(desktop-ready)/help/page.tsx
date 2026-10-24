import { COMMUNITY_COUNT } from '@jirum/domain/service-facts';
import { Metadata } from 'next';

import { checkDevice } from '@/shared/actions/agent';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

import HelpArticle from './HelpArticle';

/** 지름알림이란 · 자주 묻는 질문 — 본문·문구 규칙은 HelpArticle.tsx 머리 주석. PC 마이페이지 안에서는 /mypage/help 가 같은 본문을 연다. */
const PATH = '/help';
// 검색 결과에서 잘리지 않는 길이 — 제목 ~30자, 설명 ~100자(모바일 검색 결과 기준). 예전 제목 43자·설명 170자는 뒤가 잘렸다.
const title = '지름알림이란? 핫딜 알림 사용법·자주 묻는 질문';
const description = `뽐뿌·에펨코리아 등 커뮤니티 ${COMMUNITY_COUNT}의 핫딜을 한곳에 모아 진짜 싼지 따져 보고, 원하는 상품이 올라오면 알려주는 무료 서비스예요. 다른 점·사용법·자주 묻는 질문을 모았어요.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${METADATA_SERVICE_URL}${PATH}` },
  openGraph: {
    title,
    description,
    url: `${METADATA_SERVICE_URL}${PATH}`,
    type: 'article',
    siteName: '지름알림',
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

export default async function HelpPage() {
  // 앱은 이 페이지를 웹뷰로 연다 — 웹 마이페이지·앱 받기 버튼은 앱 안에선 엉뚱한 곳으로 간다.
  const { isJirumAlarmApp } = await checkDevice();
  return <HelpArticle isJirumAlarmApp={isJirumAlarmApp} />;
}
