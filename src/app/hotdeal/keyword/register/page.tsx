'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Card from '@/components/Card';
import WeightSetter from './components/WeightSetter';
import PrimaryKeyword from './components/PrimaryKeyword';
import { useState } from 'react';
import { HotDealKeywordType } from '@/types/keyword';
import { useAddHotDealKeyword } from '@/hooks/graphql/keyword';
import { useRouter } from 'next/navigation';

interface KeywordFormType {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

const KeywordRegister = () => {
  const router = useRouter();
  const [keyword, setKeyword] = useState<KeywordFormType>({
    type: HotDealKeywordType.POSITIVE,
    keyword: '',
    weight: 1,
    isMajor: false,
  });
  const [mutate] = useAddHotDealKeyword({
    onCompleted: () => {
      alert('키워드 등록 성공!');
      router.push('/hotdeal/keyword');
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
    <DefaultLayout>
      <div className="flex flex-col gap-2">
        <Card>
          <WeightSetter weight={keyword.weight} onChange={handleChangeWeight} />
        </Card>
        <Card>
          <PrimaryKeyword
            keyword={keyword.keyword}
            keywordType={keyword.type}
            onChangeKeyword={handleChangeKeyword}
            onChangeKeywordType={handleChangeKeywordType}
          />
        </Card>
        <div>
          <button className="rounded bg-slate-600 p-2 text-white" onClick={handleKeywordRegister}>
            저장
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordRegister;
