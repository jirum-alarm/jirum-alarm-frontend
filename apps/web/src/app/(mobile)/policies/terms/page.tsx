import { TERMS_CONTENT_DATA, TERMS_INDEX_DATA } from '@/shared/config/policy';
import TermsLayout from '@/shared/ui/policies/TermsLayout';

const TermsOfUsePage = () => {
  return <TermsLayout termsIndexData={TERMS_INDEX_DATA} termsContentData={TERMS_CONTENT_DATA} />;
};

export default TermsOfUsePage;
