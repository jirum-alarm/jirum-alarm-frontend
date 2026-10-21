import { Metadata } from 'next';

import { robotsDirective } from '@/shared/config/metadata';
import { PRIVACY_CONTENT_DATA, PRIVACY_DATES, PRIVACY_INDEX_DATA } from '@/shared/config/policy';

import TermsLayout from '../components/TermsLayout';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 지름알림',
  description: '지름알림 개인정보처리방침 안내입니다.',
  alternates: { canonical: '/policies/privacy' },
  robots: robotsDirective, // (mobile) 그룹 기본 noindex를 오버라이드(운영만 공개 색인 — dev 는 noindex)
};

const PrivacyPolicyPage = () => {
  return (
    <TermsLayout
      title="개인정보 처리방침"
      dates={PRIVACY_DATES}
      termsIndexData={PRIVACY_INDEX_DATA}
      termsContentData={PRIVACY_CONTENT_DATA}
    />
  );
};

export default PrivacyPolicyPage;
