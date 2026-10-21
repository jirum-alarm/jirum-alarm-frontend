import { Metadata } from 'next';

import { robotsDirective } from '@/shared/config/metadata';
import { TERMS_CONTENT_DATA, TERMS_DATES, TERMS_INDEX_DATA } from '@/shared/config/policy';

import TermsLayout from '../components/TermsLayout';

export const metadata: Metadata = {
  title: '이용약관 | 지름알림',
  description: '지름알림 서비스 이용약관 안내입니다.',
  alternates: { canonical: '/policies/terms' },
  robots: robotsDirective, // (mobile) 그룹 기본 noindex를 오버라이드(운영만 공개 색인 — dev 는 noindex)
};

const TermsOfUsePage = () => {
  return (
    <TermsLayout
      title="서비스 이용약관"
      dates={TERMS_DATES}
      termsIndexData={TERMS_INDEX_DATA}
      termsContentData={TERMS_CONTENT_DATA}
    />
  );
};

export default TermsOfUsePage;
