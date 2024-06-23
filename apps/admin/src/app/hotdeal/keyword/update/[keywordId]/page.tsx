'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Card from '@/components/Card';
import { useState } from 'react';
import { HotDealKeywordType } from '@/types/keyword';
import { useGetHotDealDetailKeyword, useUpdateHotDealKeyword } from '@/hooks/graphql/keyword';
import { useRouter } from 'next/navigation';
import WeightSetter from '../../components/WeightSetter';
import PrimaryKeyword from '../../components/PrimaryKeywordForm';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';

interface KeywordFormType {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

interface Props {
  params: {
    keywordId: string;
  };
}

const KeywordUpdatePage = ({ params }: Props) => {
  const keywordId = Number(params.keywordId);
  const router = useRouter();
  const [keyword, setKeyword] = useState<KeywordFormType>({
    type: HotDealKeywordType.POSITIVE,
    keyword: '',
    weight: 1,
    isMajor: false,
  });
  const { loading: detailKeywordLoading } = useGetHotDealDetailKeyword({
    variables: {
      id: keywordId,
    },
    onCompleted: (data) => {
      const {
        hotDealKeywordByAdmin: { type, keyword, weight, isMajor },
      } = data;
      setKeyword({ type, keyword, weight, isMajor });
    },
  });
  const [mutate, { loading }] = useUpdateHotDealKeyword(keyword.type, {
    onCompleted: () => {
      alert('키워드 수정 성공!');
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
        id: keywordId,
        keyword: keyword.keyword,
        weight: keyword.weight,
        isMajor: keyword.isMajor,
      },
    });
  };
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-2">
        <PrimaryKeyword keyword={keyword.keyword} onChangeKeyword={handleChangeKeyword} />
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
            {loading && (
              <svg
                aria-hidden="true"
                role="status"
                className="me-3 inline h-4 w-4 animate-spin text-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            )}
            수정
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordUpdatePage;
