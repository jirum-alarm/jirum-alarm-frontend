import { Metadata } from 'next';

import { PRIVACY_CONTENT_DATA, PRIVACY_INDEX_DATA } from '@/shared/config/policy';

import TermsLayout from '../components/TermsLayout';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 지름알림',
  description: '지름알림 개인정보처리방침 안내입니다.',
  alternates: { canonical: '/policies/privacy' },
};

const PrivacyPolicyPage = () => {
  return (
    <TermsLayout termsIndexData={PRIVACY_INDEX_DATA} termsContentData={PRIVACY_CONTENT_DATA} />
  );
};

export default PrivacyPolicyPage;
