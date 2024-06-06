'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordSearch from './components/KeywordSearch';
import SynonymInputResult from './components/SynonymInputResult';
import { useGetHotDealKeyword } from '@/hooks/graphql/keyword';

const KeywordDetailPage = ({ params }: { params: { keywordId: string } }) => {
  const { data } = useGetHotDealKeyword();
  console.log('data', data);
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
