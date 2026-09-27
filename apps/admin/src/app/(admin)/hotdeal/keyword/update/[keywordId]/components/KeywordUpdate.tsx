'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';
import { useGetHotDealDetailKeyword, useUpdateHotDealKeyword } from '@/hooks/graphql/keyword';
import { HotDealKeywordType } from '@/types/keyword';

import PrimaryKeywordForm from '../../../components/PrimaryKeywordForm';
import WeightSetter from '../../../components/WeightSetter';

interface KeywordFormType {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

interface Props {
  keywordId: string;
}

const KeywordUpdate = ({ keywordId }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const [keyword, setKeyword] = useState<KeywordFormType>({
    type: HotDealKeywordType.POSITIVE,
    keyword: '',
    weight: 1,
    isMajor: false,
  });

  useGetHotDealDetailKeyword({
    variables: {
      id: Number(keywordId),
    },
    onCompleted: (data) => {
      const { type, keyword, weight, isMajor } = data.hotDealKeywordByAdmin!;
      setKeyword({ type, keyword, weight, isMajor });
    },
  });

  const [mutate, { loading }] = useUpdateHotDealKeyword(keyword.type, {
    onCompleted: () => {
      toast.success('키워드 수정 성공!');
      router.back();
    },
  });
  const handleChangeWeight = (value: number) => {
    setKeyword((keyword) => ({
      ...keyword,
      weight: value,
    }));
  };
  const handleChangeKeyword = (value: string) => {
    setKeyword((keyword) => ({
      ...keyword,
      keyword: value,
    }));
  };

  const handleKeywordUpdate = () => {
    mutate({
      variables: {
        id: Number(keywordId),
        keyword: keyword.keyword,
        weight: keyword.weight,
        isMajor: keyword.isMajor,
      },
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <PrimaryKeywordForm keyword={keyword.keyword} onChangeKeyword={handleChangeKeyword} />
      <WeightSetter weight={keyword.weight} onChange={handleChangeWeight} />
      <Card>
        <span className="text-black">유형 : </span>
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            keyword.type === HotDealKeywordType.POSITIVE
              ? 'bg-success text-success'
              : keyword.type === HotDealKeywordType.NEGATIVE
                ? 'bg-danger text-danger'
                : ''
          }`}
        >
          {HotDealKeywordTypeMap[keyword.type]}
        </p>
      </Card>
      <div>
        <button
          className="flex items-center rounded bg-slate-600 p-2 text-white"
          disabled={loading}
          onClick={handleKeywordUpdate}
        >
          {loading && <Spinner size="sm" color="white" className="me-3" />}
          수정
        </button>
      </div>
    </div>
  );
};

export default KeywordUpdate;
