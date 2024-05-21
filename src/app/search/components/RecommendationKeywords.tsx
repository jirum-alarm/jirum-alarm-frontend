'use client';

import { mp } from '@/lib/mixpanel';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
];

export default function RecommendationKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    setKeywords(KEYWORDS.sort(() => 0.5 - Math.random()).slice(0, 5));
  }, []);
  return (
    <section>
      <h2 className="py-4">추천 검색어</h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, i) => (
          <Chip key={i} keyword={keyword} />
        ))}
      </div>
    </section>
  );
}

function Chip({ keyword }: { keyword: string }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/search?keyword=${keyword}&tab-index=0&category-id=0`);

    mp.track('Keyword Click', {
      keyword,
      type: 'Recommendation',
      page: 'Serach',
    });
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
