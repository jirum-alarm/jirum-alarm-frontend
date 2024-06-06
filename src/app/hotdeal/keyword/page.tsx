'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { useRouter } from 'next/navigation';
import HotdealKeywordsTable from './components/HotdealKeywordsTable';

const KeywordPage = () => {
  const router = useRouter();

  const moveKeywordRegister = () => {
    router.push('/hotdeal/keyword/register');
  };
  return (
    <DefaultLayout>
      <div className="flex w-full justify-end">
        <button
          className="mb-2 rounded-xl bg-lime-400 p-2 text-white"
          onClick={moveKeywordRegister}
        >
          추가
        </button>
      </div>
      <div className="flex gap-3">
        <HotdealKeywordsTable />
      </div>
    </DefaultLayout>
  );
};

export default KeywordPage;
