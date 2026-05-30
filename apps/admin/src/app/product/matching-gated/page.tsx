'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useIsLoggedIn from '@/hooks/useIsLoggedIn';

import GatedMappingList from './components/GatedMappingList';

const GatedMappingPage = () => {
  const isLoggedIn = useIsLoggedIn();

  return (
    <DefaultLayout isLoggedIn={isLoggedIn}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-black dark:text-white">게이트 차단 매핑</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          추출 오염 / 묶음글 등으로 매칭 전 차단된 항목. 원본 제목과 추출 결과(brand/model)를 대조해
          진짜 오염이면 <b>거절 유지</b>, 게이트 오판이면 <b>승인</b>(재매칭 대상)으로 처리하세요.
        </p>
      </div>
      <GatedMappingList />
    </DefaultLayout>
  );
};

export default GatedMappingPage;
