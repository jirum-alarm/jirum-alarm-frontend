'use client';

import { useKeywordList } from '../../model/useKeywordList';

import KeywordItem from './KeywordItem';

const KeywordList = () => {
  const { notificationKeywordsByMe, onDeleteKeyword } = useKeywordList();
  const keywords = notificationKeywordsByMe ?? [];

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900">내 키워드</h2>
        <span className="text-xs text-gray-500">{keywords.length}/20</span>
      </div>
      {keywords.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          아직 등록한 키워드가 없어요.
          <br />
          갖고 싶은 상품 이름을 등록하면 새 핫딜이 올라올 때 알려드려요.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-gray-500">
            키워드를 누르면 알림 받을 조건을 바꿀 수 있어요.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {keywords.map((keyword) => (
              <KeywordItem
                key={keyword.id}
                keyword={{
                  id: Number(keyword.id),
                  keyword: keyword.keyword,
                  priceDropOnly: keyword.priceDropOnly ?? false,
                  excludeKeywords: keyword.excludeKeywords ?? [],
                  minPrice: keyword.minPrice ?? null,
                  maxPrice: keyword.maxPrice ?? null,
                }}
                onDelete={() => onDeleteKeyword(keyword.id)}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default KeywordList;
