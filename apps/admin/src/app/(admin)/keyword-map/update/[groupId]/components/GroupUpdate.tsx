'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { useGetKeywordMapGroup, useUpdateKeywordMapGroup } from '@/hooks/graphql/keywordMap';

interface Props {
  groupId: string;
}

const GroupUpdate = ({ groupId }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const { data, loading: fetching } = useGetKeywordMapGroup({
    variables: { id: Number(groupId) },
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (data?.keywordMapGroupByAdmin) {
      setName(data.keywordMapGroupByAdmin.name);
      setDescription(data.keywordMapGroupByAdmin.description ?? '');
    }
  }, [data]);

  const [mutate, { loading }] = useUpdateKeywordMapGroup({
    onCompleted: () => {
      toast.success('그룹이 수정되었습니다.');
      router.push('/keyword-map');
    },
    onError: (e) => toast.error(`수정 실패: ${e.message}`),
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('그룹 이름을 입력해주세요.');
      return;
    }
    mutate({
      variables: {
        id: Number(groupId),
        name: name.trim(),
        // undefined 는 서버 update 가 건너뛰어 설명을 비울 수 없다 — null 이어야 NULL 로 쓴다
        description: description.trim() || null,
      },
    });
  };

  if (fetching) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 rounded-sm bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              그룹 이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 전자제품, 식품"
              className="h-full w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-hidden transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="그룹에 대한 설명을 입력하세요"
              rows={3}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-hidden transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div>
            <button
              className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading && <Spinner size="sm" color="white" className="me-3" />}
              수정
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupUpdate;
