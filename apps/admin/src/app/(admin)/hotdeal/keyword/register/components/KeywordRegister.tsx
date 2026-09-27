'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { useAddHotDealKeyword } from '@/hooks/graphql/keyword';
import { HotDealKeywordType } from '@/types/keyword';

import PrimaryKeywordForm from '../../components/PrimaryKeywordForm';
import WeightSetter from '../../components/WeightSetter';

import KeywordTypeForm from './KeywordTypeForm';

interface KeywordFormType {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

const KeywordRegister = () => {
  const router = useRouter();
  const toast = useToast();
  const [keyword, setKeyword] = useState<KeywordFormType>({
    type: HotDealKeywordType.POSITIVE,
    keyword: '',
    weight: 1,
    isMajor: false,
  });
  const [mutate, { loading }] = useAddHotDealKeyword(keyword.type, {
    onCompleted: () => {
      toast.success('키워드 등록 성공!');
      router.push(`/hotdeal/keyword?keywordType=${keyword.type}`);
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
  const handleChangeKeywordType = (type: HotDealKeywordType) => {
    setKeyword((keyword) => ({
      ...keyword,
      type,
    }));
  };
  const handleKeywordRegister = () => {
    mutate({
      variables: keyword,
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <PrimaryKeywordForm keyword={keyword.keyword} onChangeKeyword={handleChangeKeyword} />
      <WeightSetter weight={keyword.weight} onChange={handleChangeWeight} />
      <KeywordTypeForm onChangeKeywordType={handleChangeKeywordType} keywordType={keyword.type} />
      <div>
        <button
          className="flex items-center rounded bg-slate-600 p-2 text-white"
          disabled={loading}
          onClick={handleKeywordRegister}
        >
          {loading && <Spinner size="sm" color="white" className="me-3" />}
          추가
        </button>
      </div>
    </div>
  );
};

export default KeywordRegister;
