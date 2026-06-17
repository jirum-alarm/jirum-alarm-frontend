'use client';

import { Close } from '@/shared/ui/common/icons';

import { useKeywordList } from '../../model/useKeywordList';

const KeywordList = () => {
  const { notificationKeywordsByMe, onDeleteKeyword } = useKeywordList();

  return (
    <div className="pb-32">
      <div>
        <div className="typography-body-14m text-fg-primary flex justify-between">
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
          <li className="border-border-default border-b px-2 py-3" key={keyword.id}>
            <div className="flex w-full items-center justify-between">
              <span className="text-fg-primary text-sm">{keyword.keyword}</span>
              <button
                role="button"
                className="text-fg-tertiary -m-2 p-2"
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
