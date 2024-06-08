'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordSearch from './components/KeywordSearch';
import SynonymInputResult from './components/SynonymInputResult';
import { useGetHotDealKeyword } from '@/hooks/graphql/keyword';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';
import KeywordDetailInfo from './components/KeywordDetailInfo';

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
          <KeywordDetailInfo
            keyword={data?.hotDealKeywordByAdmin.keyword}
            weight={data?.hotDealKeywordByAdmin.weight}
            type={data?.hotDealKeywordByAdmin.type}
          ></KeywordDetailInfo>
          <SynonymInputResult
            keywordId={params.keywordId}
            synonymList={data?.hotDealKeywordByAdmin.synonyms ?? []}
            excludeKeywordList={data?.hotDealKeywordByAdmin.excludeKeywords ?? []}
          />
          <KeywordSearch keywordId={params.keywordId}/>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
