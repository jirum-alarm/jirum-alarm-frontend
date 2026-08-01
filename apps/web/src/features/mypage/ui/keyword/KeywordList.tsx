'use client';

import { Close } from '@/shared/ui/common/icons';

import { useKeywordList } from '../../model/useKeywordList';

import PriceDropOnlyToggle from './PriceDropOnlyToggle';

const KeywordList = () => {
  const { notificationKeywordsByMe, onDeleteKeyword } = useKeywordList();

  return (
    <div className="pb-32">
      <div>
        <div className="flex justify-between text-sm font-medium text-gray-900">
          <span>나의 지름 키워드</span>
          <p>
            <span className="text-primary-500">{notificationKeywordsByMe?.length ?? 0}</span>
            <span>/</span>
            <span>20</span>
          </p>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          &lsquo;가격 하락 알림&rsquo;을 켜면 등록했을 때보다 싸게 올라온 딜만 알려드려요
        </p>
      </div>
      <div className="h-4" />
      <ul>
        {notificationKeywordsByMe?.map((keyword) => (
          <li className="border-b border-gray-200 px-2 py-3" key={keyword.id}>
            <div className="flex w-full items-center justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
                {keyword.keyword}
              </span>
              <PriceDropOnlyToggle
                keywordId={Number(keyword.id)}
                priceDropOnly={keyword.priceDropOnly ?? false}
              />
              <button
                role="button"
                className="-m-2 shrink-0 p-2 text-gray-400"
                aria-label="키워드 삭제"
                onClick={() => onDeleteKeyword(keyword.id)}
              >
                <Close width={20} height={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeywordList;
