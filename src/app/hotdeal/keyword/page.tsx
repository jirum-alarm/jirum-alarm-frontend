import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import SynonymInputResult from './components/SynonymInputResult';
import PrimaryKeyword from './components/PrimaryKeyword';
import WeightSetter from './components/WeightSetter';
import KeywordSearch from './components/KeywordSearch';

const KeywordPage = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <WeightSetter />
        <PrimaryKeyword />
        <div className="flex gap-3">
          <SynonymInputResult />
          <KeywordSearch />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordPage;
