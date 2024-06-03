'use client';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { useRouter } from 'next/navigation';
import TableThree from './components/TableThree';

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
        <TableThree />
      </div>
    </DefaultLayout>
  );
};

export default KeywordPage;
