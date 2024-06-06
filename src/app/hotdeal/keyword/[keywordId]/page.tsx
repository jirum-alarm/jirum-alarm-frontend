'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordSearch from './components/KeywordSearch';
import SynonymInputResult from './components/SynonymInputResult';
import { useGetHotDealKeyword } from '@/hooks/graphql/keyword';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';

const KeywordDetailPage = ({ params }: { params: { keywordId: string } }) => {
  const { data } = useGetHotDealKeyword({
    variables: {
      id: Number(params.keywordId),
    },
  });
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg text-black">키워드 : {data?.hotDealKeywordByAdmin.keyword}</h2>
          <h2 className="text-lg text-black">가중치 : {data?.hotDealKeywordByAdmin.weight}</h2>
          <h2 className="text-lg text-black">
            유형 :{' '}
            {data?.hotDealKeywordByAdmin && HotDealKeywordTypeMap[data.hotDealKeywordByAdmin.type]}
          </h2>
          <SynonymInputResult
            keywordId={params.keywordId}
            synonymList={data?.hotDealKeywordByAdmin.synonyms ?? []}
            excludeKeywordList={data?.hotDealKeywordByAdmin.excludeKeywords ?? []}
          />
          <KeywordSearch />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
