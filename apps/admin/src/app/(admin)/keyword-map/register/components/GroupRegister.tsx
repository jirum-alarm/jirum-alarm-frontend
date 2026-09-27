'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Card from '@/components/Card';
import { useAddKeywordMapGroup } from '@/hooks/graphql/keywordMap';

const GroupRegister = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [mutate, { loading }] = useAddKeywordMapGroup({
    onCompleted: () => {
      alert('그룹이 등록되었습니다.');
      router.push('/keyword-map');
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('그룹 이름을 입력해주세요.');
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
              등록
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupRegister;
