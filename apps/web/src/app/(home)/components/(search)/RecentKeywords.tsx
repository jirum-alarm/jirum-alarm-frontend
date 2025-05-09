'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Close } from '@/components/common/icons';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';
import { cn } from '@/lib/cn';

export default function RecentKeywords() {
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<string[]>([]);

  const { isMobile } = useDevice();

  const searchParams = useSearchParams();

  useEffect(() => {
    setKeywords(JSON.parse(localStorage.getItem('gr-recent-keywords') ?? '[]'));
    setLoading(false);
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
        <section>
          <h2 className="flex h-[56px] items-center font-semibold text-gray-900">최근 검색어</h2>
          <div className={cn(isMobile && 'no-scrollbar h-[42px] overflow-x-scroll')}>
            {loading ? (
              <div className="flex items-center text-sm">최근 검색어를 불러오는 중입니다...</div>
            ) : (
              <div className={cn('flex gap-2', !isMobile && 'flex-wrap')}>
                {keywords.length !== 0 ? (
                  keywords.map((keyword, i) => (
                    <Chip
                      key={i}
                      keyword={keyword}
                      handleRemoveRecentKeyword={handleRemoveRecentKeyword}
                    />
                  ))
                ) : (
                  <span className="text-gray-400">검색 내역이 없어요.</span>
                )}
              </div>
            )}
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

  const handleClick = () => {
    router.push(`/search?keyword=${keyword}`);

    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   keyword,
    //   type: EVENT.PRODUCT_SEARCH.TYPE.RECENT,
    //   page: EVENT.PAGE.SEARCH,
    // });
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    handleRemoveRecentKeyword(keyword);
  };

  return (
    <div
      onClick={handleClick}
      className="flex h-[40px] flex-shrink-0 items-center gap-x-1 truncate rounded-[40px] border border-gray-200 px-3 text-gray-900 hover:cursor-pointer hover:bg-gray-200"
    >
      {keyword.slice(0, 15)}
      {keyword.length > 15 ? '...' : ''}

      <div onClick={handleClose}>
        <Close />
      </div>
    </div>
  );
}
