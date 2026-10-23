'use client';

import { emptyText, keywordChip } from '@jirum/design-system/recipes';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useDevice } from '@/shared/hooks/useDevice';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { cn } from '@/shared/lib/cn';
import { Close } from '@/shared/ui/common/icons';
import SectionHeader from '@/shared/ui/SectionHeader';

import { navigateToSearch } from '../hooks/useSearchInputViewModel';

export default function RecentKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);

  const { device } = useDevice();

  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 최근 검색어는 localStorage(외부 저장소)에 있다. 서버 HTML 과 맞추려 마운트 뒤·검색어가 바뀔 때 다시 읽는다.
    setKeywords(JSON.parse(localStorage.getItem('gr-recent-keywords') ?? '[]'));
  }, [searchParams]);

  const handleRemoveRecentKeyword = (keyword: string) => {
    const recentKeywords = localStorage.getItem('gr-recent-keywords') ?? '[]';
    const newRecentKeys = JSON.parse(recentKeywords).filter((key: string) => key !== keyword);

    localStorage.setItem('gr-recent-keywords', JSON.stringify(newRecentKeys));

    const updatedKeywords = JSON.parse(localStorage.getItem('gr-recent-keywords') ?? '[]');
    setKeywords(updatedKeywords);
  };

  return (
    <>
      {keywords.length > 0 && (
        <section className="pc:px-0 px-5">
          <SectionHeader title="최근 검색어" shouldShowMobileUI />
          <div className={cn(device.isMobile && 'no-scrollbar h-[42px] overflow-x-scroll')}>
            {/* 목록은 마운트 뒤 localStorage 에서 읽은 그 순간 함께 생긴다 — 기다리는 상태가 따로 없다. */}
            <div className={cn('flex gap-2', !device.isMobile && 'flex-wrap')}>
              {keywords.length !== 0 ? (
                keywords.map((keyword, i) => (
                  <Chip
                    key={i}
                    keyword={keyword}
                    handleRemoveRecentKeyword={handleRemoveRecentKeyword}
                  />
                ))
              ) : (
                <span className={emptyText}>검색 내역이 없어요.</span>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Chip({
  keyword,
  handleRemoveRecentKeyword,
}: {
  keyword: string;
  handleRemoveRecentKeyword: (keyword: string) => void;
}) {
  const router = useMyRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    navigateToSearch(router, keyword, searchParams.get('keyword'));
  };

  // 칩 = 검색어 버튼 + 삭제 버튼. button 안에 button 을 못 넣으므로 겉 div 가 칩 모양을 맡는다.
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-x-1 truncate hover:bg-gray-50',
        keywordChip.box,
        keywordChip.text,
      )}
    >
      <button type="button" onClick={handleClick} className="cursor-pointer truncate">
        {keyword.slice(0, 15)}
        {keyword.length > 15 ? '...' : ''}
      </button>

      <button
        type="button"
        onClick={() => handleRemoveRecentKeyword(keyword)}
        aria-label={`최근 검색어 ${keyword} 삭제`}
        className="shrink-0 cursor-pointer"
      >
        <Close />
      </button>
    </div>
  );
}
