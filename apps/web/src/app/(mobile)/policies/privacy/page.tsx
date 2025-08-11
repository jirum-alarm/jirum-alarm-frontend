import { PRIVACY_CONTENT_DATA, PRIVACY_INDEX_DATA } from '@/constants/policy';

import TermsLayout from '../components/TermsLayout';

const PrivacyPolicyPage = () => {
  return (
    <TermsLayout termsIndexData={PRIVACY_INDEX_DATA} termsContentData={PRIVACY_CONTENT_DATA} />
  );
};

export default PrivacyPolicyPage;
