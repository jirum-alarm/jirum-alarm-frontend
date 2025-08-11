import { TERMS_CONTENT_DATA, TERMS_INDEX_DATA } from '@/constants/policy';

import TermsLayout from '../components/TermsLayout';

const TermsOfUsePage = () => {
  return <TermsLayout termsIndexData={TERMS_INDEX_DATA} termsContentData={TERMS_CONTENT_DATA} />;
};

export default TermsOfUsePage;
