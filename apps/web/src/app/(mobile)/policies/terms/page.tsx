import { Metadata } from 'next';

import { TERMS_CONTENT_DATA, TERMS_INDEX_DATA } from '@/shared/config/policy';

import TermsLayout from '../components/TermsLayout';

export const metadata: Metadata = {
  title: '이용약관 | 지름알림',
  description: '지름알림 서비스 이용약관 안내입니다.',
  alternates: { canonical: '/policies/terms' },
};

const TermsOfUsePage = () => {
  return <TermsLayout termsIndexData={TERMS_INDEX_DATA} termsContentData={TERMS_CONTENT_DATA} />;
};

export default TermsOfUsePage;
