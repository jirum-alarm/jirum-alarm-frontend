'use client';

import { RECOMMENDED_KEYWORD_COUNT } from '@jirum/domain/search';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PAGE } from '@/shared/config/page';
import useMyRouter from '@/shared/hooks/useMyRouter';
import SectionHeader from '@/shared/ui/SectionHeader';

import { KEYWORD_HUB_MIN_DEALS } from '@/entities/keyword-hub/lib/keyword-hub';
import { useKeywordHubs } from '@/entities/keyword-hub/model/useKeywordHubs';

import { navigateToSearch } from '../hooks/useSearchInputViewModel';

/**
 * 검색 초기 화면의 추천 검색어 5개 — 공개 키워드 허브에서 뽑는다(2026-10-14까지는 하드코딩 25개).
 * 허브는 "30일 딜이 충분하고 제목이 그 상품"인 것만 판정해 둔 목록이라, 누르면 결과가 비거나 엉뚱할 일이 적고
 * 결과 위에 허브 요약 카드가 뜬다. 목록을 못 받으면 섹션을 숨긴다.
 */
export default function RecommendationKeywords() {
  const { data: hubs } = useKeywordHubs();
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (!hubs) return;
    const pool = hubs.filter((h) => h.recentDealCount >= KEYWORD_HUB_MIN_DEALS).map((h) => h.name);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 무작위 추천은 서버와 브라우저 결과가 달라 하이드레이션 뒤에 한 번 뽑는다.
    setKeywords([...pool].sort(() => 0.5 - Math.random()).slice(0, RECOMMENDED_KEYWORD_COUNT));
  }, [hubs]);

  if (keywords.length === 0) return null;

  return (
    <section className="pc:px-0 px-5">
      {/* 모바일 웹엔 상단 메뉴가 없어 키워드 목록(/keywords)으로 가는 길이 여기뿐이다(2026-10-17). */}
      <SectionHeader
        title="추천 검색어"
        shouldShowMobileUI
        right={
          <Link
            href={PAGE.KEYWORDS}
            data-track="keyword-index-link"
            data-source="search_recommend"
            className="text-sm text-gray-500"
          >
            키워드 전체 보기
          </Link>
        }
      />
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
  const searchParams = useSearchParams();

  const handleClick = () => {
    navigateToSearch(router, keyword, searchParams.get('keyword'));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-gray-50 px-3 py-2 text-gray-900 hover:cursor-pointer hover:bg-gray-200"
    >
      {keyword}
    </button>
  );
}
