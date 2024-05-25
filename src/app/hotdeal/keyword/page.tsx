import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordInputChip from './components/KeywordInputChip';
import KeywordResult from './components/KeywordResult';
import SynonymRegister from './components/SynonymRegister';

const KeywordPage = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <KeywordInputChip />
        <KeywordResult />
        <SynonymRegister />
      </div>
    </DefaultLayout>
  );
};

export default KeywordPage;
