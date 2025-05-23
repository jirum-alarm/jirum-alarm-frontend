'use client';

import { useEffect, useState } from 'react';

import SectionHeader from '@/components/SectionHeader';
import useMyRouter from '@/hooks/useMyRouter';

const KEYWORDS = [
  '쌀',
  '라면',
  '모니터',
  '스팸',
  '헤드셋',
  '청소기',
  '신발',
  '의자',
  '캠핑',
  '칫솔',
  '고기',
  '비비고',
  '시리얼',
  '물티슈',
  '생수',
  '컴퓨터',
  '마우스',
  '키보드',
  '닭가슴살',
  '사이다',
  '맥북',
  '갤럭시',
  '아이폰',
  '콜라',
  '치킨',
];

export default function RecommendationKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    setKeywords(KEYWORDS.sort(() => 0.5 - Math.random()).slice(0, 5));
  }, []);
  return (
    <section>
      <SectionHeader title="추천 검색어" titleClassName="text-base" />
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, i) => (
          <Chip key={i} keyword={keyword} />
        ))}
      </div>
    </section>
  );
}

function Chip({ keyword }: { keyword: string }) {
  const router = useMyRouter();

  const handleClick = () => {
    router.push(`/search?keyword=${keyword}`);

    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   keyword,
    //   type: EVENT.PRODUCT_SEARCH.TYPE.RECOMMENDATION,
    //   page: EVENT.PAGE.SEARCH,
    // });
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-[40px] bg-gray-50 px-3 py-2 text-gray-900 hover:cursor-pointer hover:bg-gray-200"
    >
      {keyword}
    </div>
  );
}
