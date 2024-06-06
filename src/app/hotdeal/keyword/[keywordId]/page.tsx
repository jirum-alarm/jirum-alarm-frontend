import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordSearch from './components/KeywordSearch';
import SynonymInputResult from './components/SynonymInputResult';

const KeywordDetailPage = ({ params }: { params: { keywordId: string } }) => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <SynonymInputResult keywordId={params.keywordId} />
          <KeywordSearch />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
