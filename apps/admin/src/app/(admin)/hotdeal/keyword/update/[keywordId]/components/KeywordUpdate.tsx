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

  const { data: detail } = useGetHotDealDetailKeyword({
    variables: {
      id: Number(keywordId),
    },
  });
  // Apollo 4 는 useQuery 의 onCompleted 를 없앴다 — 받아온 값이 바뀔 때 폼을 채운다(effect 대신 렌더 중 비교로)
  const [syncedDetail, setSyncedDetail] = useState<typeof detail>(undefined);
  if (detail !== syncedDetail) {
    setSyncedDetail(detail);
    const fetched = detail?.hotDealKeywordByAdmin;
    if (fetched) {
      const { type, keyword, weight, isMajor } = fetched;
      setKeyword({ type, keyword, weight, isMajor });
    }
  }

  const [mutate, { loading }] = useUpdateHotDealKeyword(keyword.type, {
    onCompleted: () => {
      toast.success('키워드 수정 성공!');
      router.back();
    },
    onError: (e) => toast.error(`수정 실패: ${e.message}`),
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
    // 서버 @IsNotEmpty 는 공백만 있는 문자열을 통과시킨다 — 여기서 잘라서 막는다
    const trimmed = keyword.keyword.trim();
    if (!trimmed) {
      toast.error('키워드를 입력해주세요.');
      return;
    }
    mutate({
      variables: {
        id: Number(keywordId),
        keyword: trimmed,
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
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            keyword.type === HotDealKeywordType.POSITIVE
              ? 'bg-success/10 text-success'
              : keyword.type === HotDealKeywordType.NEGATIVE
                ? 'bg-danger/10 text-danger'
                : ''
          }`}
        >
          {HotDealKeywordTypeMap[keyword.type]}
        </p>
      </Card>
      <div>
        <button
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
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
