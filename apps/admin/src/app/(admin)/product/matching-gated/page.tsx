'use client';

import GatedMappingList from './components/GatedMappingList';

const GatedMappingPage = () => {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-black dark:text-white">게이트 차단 매핑</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          추출 오염 / 묶음글 등으로 매칭 전 차단된 항목. 원본 제목과 추출 결과(brand/model)를 대조해
          진짜 오염이면 <b>게이트 맞음</b>, 게이트가 잘못 막았으면 <b>오판 → 재매칭</b>(게이트를
          끄고 한 번 다시 매칭, 결과는 매칭 검수 대기로)으로 처리하세요.
        </p>
      </div>
      <GatedMappingList />
    </>
  );
};

export default GatedMappingPage;
