import { Suspense } from 'react';

import BasicLayout from '@shared/ui/layout/BasicLayout';

import KeywordInput from './components/KeywordInput';
import KeywordList from './components/KeywordList';

const KeywordPage = () => {
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="relative h-full px-5 py-6">
        <KeywordInput />
        <div className="h-10" />
        <Suspense>
          <KeywordList />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default KeywordPage;
