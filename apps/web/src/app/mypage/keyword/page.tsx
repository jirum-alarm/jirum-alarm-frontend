import { Suspense } from 'react';

import KeywordInput from './components/KeywordInput';
import KeywordList from './components/KeywordList';

import BasicLayout from '@/components/layout/BasicLayout';

const KeywordPage = () => {
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="relative h-full px-5 py-6">
        <KeywordInput />
        <div className=" h-10" />
        <Suspense>
          <KeywordList />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default KeywordPage;
