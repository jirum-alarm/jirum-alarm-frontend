import { PRIVACY_CONTENT_DATA, PRIVACY_INDEX_DATA } from '@/shared/config/policy';
import TermsLayout from '@/shared/ui/policies/TermsLayout';

const PrivacyPolicyPage = () => {
  return (
    <TermsLayout termsIndexData={PRIVACY_INDEX_DATA} termsContentData={PRIVACY_CONTENT_DATA} />
  );
};

export default PrivacyPolicyPage;
