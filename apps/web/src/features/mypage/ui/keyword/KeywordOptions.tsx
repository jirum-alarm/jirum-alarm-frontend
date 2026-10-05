'use client';

import { useState } from 'react';

import { parseExcludeKeywords, parsePrice } from '../../model/keyword-options';
import { useUpdateKeywordOptions } from '../../model/update-keyword-options';

const formatWon = (price: number) =>
  price >= 10000 && price % 10000 === 0
    ? `${(price / 10000).toLocaleString('ko-KR')}만원`
    : `${price.toLocaleString('ko-KR')}원`;

const summarize = ({
  excludeKeywords,
  minPrice,
  maxPrice,
}: {
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
}) => {
  const parts: string[] = [];
  if (minPrice != null || maxPrice != null) {
    parts.push(
      `${minPrice != null ? formatWon(minPrice) : ''}~${maxPrice != null ? formatWon(maxPrice) : ''}`,
    );
  }
  if (excludeKeywords.length) parts.push(`제외 ${excludeKeywords.length}`);
  return parts.join(' · ');
};

/**
 * 키워드 한 줄 아래 접히는 "알림 조건" — 제외 단어 + 가격 범위.
 *
 * 2026-10-01 실측: 키워드는 제목 부분일치라 "콜라"에 "콜라겐 마스크팩"이 걸리는 식의 오탐이
 * 커뮤니티 딜의 ~15%. 한글 합성어는 규칙으로 못 걸러서 유저가 제외 단어로 끈다.
 * ponytail: 펼침은 네이티브 <details> — 상태·애니메이션 라이브러리 없이 접근성까지 공짜.
 */
const KeywordOptions = ({
  keywordId,
  excludeKeywords,
  minPrice,
  maxPrice,
}: {
  keywordId: number;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
}) => {
  const [excludeInput, setExcludeInput] = useState(excludeKeywords.join(', '));
  const [minInput, setMinInput] = useState(minPrice != null ? String(minPrice) : '');
  const [maxInput, setMaxInput] = useState(maxPrice != null ? String(maxPrice) : '');
  const { mutate, isPending } = useUpdateKeywordOptions();

  const summary = summarize({ excludeKeywords, minPrice, maxPrice });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({
      id: keywordId,
      excludeKeywords: parseExcludeKeywords(excludeInput),
      minPrice: parsePrice(minInput),
      maxPrice: parsePrice(maxInput),
    });
  };

  return (
    <details className="group mt-1">
      <summary className="cursor-pointer list-none text-xs text-gray-500 [&::-webkit-details-marker]:hidden">
        <span className="underline underline-offset-2">알림 조건</span>
        {summary && <span className="text-primary-600 ml-1.5">{summary}</span>}
      </summary>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 rounded-lg bg-gray-50 p-3">
        <label className="flex flex-col gap-1 text-xs text-gray-700">
          제외할 단어
          <input
            value={excludeInput}
            onChange={(e) => setExcludeInput(e.target.value)}
            placeholder="쉼표로 구분 (예: 콜라겐, 케이스)"
            maxLength={220}
            className="focus:border-primary-500 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
          />
          <span className="text-gray-500">제목에 이 단어가 있으면 알림을 보내지 않아요</span>
        </label>
        <div className="flex flex-col gap-1 text-xs text-gray-700">
          가격 범위
          <div className="flex items-center gap-2">
            <input
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              inputMode="numeric"
              placeholder="최소 (원)"
              aria-label="최소 가격"
              className="focus:border-primary-500 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
            />
            <span className="text-gray-400">~</span>
            <input
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              inputMode="numeric"
              placeholder="최대 (원)"
              aria-label="최대 가격"
              className="focus:border-primary-500 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
            />
          </div>
          <span className="text-gray-500">
            비워두면 제한 없음 · 가격을 못 읽은 글은 그대로 알려드려요
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-500 text-fixed-900 self-end rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          저장
        </button>
      </form>
    </details>
  );
};

export default KeywordOptions;
