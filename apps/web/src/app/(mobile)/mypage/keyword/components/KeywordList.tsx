'use client';

import { Close } from '@shared/ui/icons';

import { useKeywordList } from '../hooks/useKeywordList';

const KeywordList = () => {
  const { notificationKeywordsByMe, onDeleteKeyword } = useKeywordList();

  return (
    <div className="pb-22">
      <div>
        <div className="flex justify-between text-sm font-medium text-gray-900">
          <span>나의 지름 키워드</span>
          <p>
            <span className="text-primary-500">{notificationKeywordsByMe?.length ?? 0}</span>
            <span>/</span>
            <span>20</span>
          </p>
        </div>
      </div>
      <div className="h-4" />
      <ul>
        {notificationKeywordsByMe?.map((keyword) => (
          <li className="border-b border-gray-200 px-2 py-3" key={keyword.id}>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-gray-900">{keyword.keyword}</span>
              <button
                role="button"
                className="-m-2 p-2 text-gray-400"
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
