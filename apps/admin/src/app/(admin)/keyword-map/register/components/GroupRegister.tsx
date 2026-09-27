'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { useAddKeywordMapGroup } from '@/hooks/graphql/keywordMap';

const GroupRegister = () => {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [mutate, { loading }] = useAddKeywordMapGroup({
    onCompleted: () => {
      toast.success('그룹이 등록되었습니다.');
      router.push('/keyword-map');
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('그룹 이름을 입력해주세요.');
      return;
    }
    mutate({
      variables: {
        name: name.trim(),
        description: description.trim() || undefined,
      },
    });
  };

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
              className="h-full w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          <div>
            <button
              className="flex items-center rounded bg-slate-600 p-2 text-white"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading && <Spinner size="sm" color="white" className="me-3" />}
              등록
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupRegister;
