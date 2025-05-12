'use client';

import { useGetHotDealKeyword } from '@/hooks/graphql/keyword';

import KeywordDetailInfo from './KeywordDetailInfo';
import KeywordSearch from './KeywordSearch';
import SynonymInputResult from './SynonymInputResult';

interface Props {
  keywordId: string;
}

const KeywordDetail = ({ keywordId }: Props) => {
  const { data } = useGetHotDealKeyword({
    variables: {
      id: Number(keywordId),
    },
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <KeywordDetailInfo
          keyword={data?.hotDealKeywordByAdmin.keyword}
          weight={data?.hotDealKeywordByAdmin.weight}
          type={data?.hotDealKeywordByAdmin.type}
        ></KeywordDetailInfo>
        <SynonymInputResult
          keywordId={keywordId}
          synonymList={data?.hotDealKeywordByAdmin.synonyms ?? []}
          excludeKeywordList={data?.hotDealKeywordByAdmin.excludeKeywords ?? []}
        />
        <KeywordSearch keywordId={keywordId} />
      </div>
    </div>
  );
};

export default KeywordDetail;
