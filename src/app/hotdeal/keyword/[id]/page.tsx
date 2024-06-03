import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordSearch from './components/KeywordSearch';
import SynonymInputResult from './components/SynonymInputResult';

const KeywordDetailPage = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <div className="flex w-full justify-end">
          <button className="rounded-xl bg-lime-400 p-2 text-white">저장</button>
        </div>
        <div className="flex gap-3">
          <SynonymInputResult />
          <KeywordSearch />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
