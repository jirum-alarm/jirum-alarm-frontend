'use client';

import { useRef, useState } from 'react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { trackAlarmLink } from '@/shared/lib/trackAlarmLink';
import { Close } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import {
  formatPriceInput,
  parseExcludeKeywords,
  parsePrice,
  summarizeKeywordAlert,
} from '../../model/keyword-options';
import { useUpdateKeywordOptions } from '../../model/update-keyword-options';

type Keyword = {
  id: number;
  keyword: string;
  priceDropOnly: boolean;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
};

const inputClass =
  'focus:border-primary-500 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none';

const DEAL_CHOICES = [
  { value: false, label: '새 핫딜 모두' },
  { value: true, label: '평소보다 쌀 때만' },
] as const;

/**
 * 키워드 카드 한 장. 접힌 상태엔 "어떤 알림이 오는지" 한 줄 요약만, 누르면 설정이 펼쳐진다.
 *
 * 설정 3개(받을 딜·가격 범위·제외 단어)는 저장 버튼 하나로 같이 저장한다 — 예전엔 "가격 하락
 * 알림" 스위치는 즉시 저장, "알림 조건"은 버튼 저장이라 같은 줄에서 저장 방식이 갈렸다.
 * 제외 단어는 키워드가 제목 부분일치라 생기는 오탐("콜라" → "콜라겐 마스크팩", 2026-10-01 실측
 * 커뮤니티 딜의 ~15%)을 유저가 끄는 용도.
 * ponytail: 펼침은 네이티브 <details> — 상태·애니메이션 라이브러리 없이 접근성까지 공짜.
 */
const KeywordItem = ({
  keyword,
  onDelete,
  defaultOpen = false,
}: {
  keyword: Keyword;
  onDelete: () => void;
  /** 알림 한 줄의 키워드 링크에서 들어오면 펼친 채로 시작한다. */
  defaultOpen?: boolean;
}) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [priceDropOnly, setPriceDropOnly] = useState(keyword.priceDropOnly);
  const [excludeInput, setExcludeInput] = useState(keyword.excludeKeywords.join(', '));
  const [minInput, setMinInput] = useState(formatPriceInput(String(keyword.minPrice ?? '')));
  const [maxInput, setMaxInput] = useState(formatPriceInput(String(keyword.maxPrice ?? '')));
  const { mutate, isPending } = useUpdateKeywordOptions({
    onSuccess: () => detailsRef.current?.removeAttribute('open'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({
      id: keyword.id,
      excludeKeywords: parseExcludeKeywords(excludeInput),
      minPrice: parsePrice(minInput),
      maxPrice: parsePrice(maxInput),
      priceDropOnly: priceDropOnly !== keyword.priceDropOnly ? priceDropOnly : undefined,
    });
  };

  return (
    <li className="rounded-xl border border-gray-200">
      <details ref={detailsRef} open={defaultOpen} className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 py-3 pr-2 pl-4 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{keyword.keyword}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {summarizeKeywordAlert(keyword)}
            </p>
          </div>
          <span className="shrink-0 text-xs text-gray-500 group-open:hidden">설정</span>
          <span className="hidden shrink-0 text-xs text-gray-500 group-open:inline">접기</span>
          {/* preventDefault — summary 안 클릭은 기본 동작이 펼침/접힘이라 삭제를 눌러도 카드가 같이 열린다. */}
          <button
            type="button"
            className="shrink-0 p-2 text-gray-500"
            aria-label={`${keyword.keyword} 키워드 삭제`}
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
          >
            <Close width={20} height={20} />
          </button>
        </summary>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 border-t border-gray-100 px-4 pt-4 pb-4"
        >
          <Link
            href={`${PAGE.SEARCH}?keyword=${encodeURIComponent(keyword.keyword)}`}
            onClick={() => trackAlarmLink('keyword_deals')}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100"
          >
            <span className="truncate">‘{keyword.keyword}’ 지금 올라온 딜 보기</span>
            <span className="text-gray-500">›</span>
          </Link>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-medium text-gray-900">
              어떤 딜을 알려드릴까요?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {DEAL_CHOICES.map((choice) => (
                <label
                  key={choice.label}
                  className={cn(
                    'cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm',
                    priceDropOnly === choice.value
                      ? 'border-primary-500 bg-primary-50 font-semibold text-gray-900'
                      : 'border-gray-200 text-gray-500',
                  )}
                >
                  <input
                    type="radio"
                    name={`deal-${keyword.id}`}
                    className="sr-only"
                    checked={priceDropOnly === choice.value}
                    onChange={() => setPriceDropOnly(choice.value)}
                  />
                  {choice.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {priceDropOnly
                ? '이 상품이 평소 가격보다 싸게 올라왔을 때만 알려드려요.'
                : `제목에 ‘${keyword.keyword}’가 들어간 새 핫딜을 모두 알려드려요.`}
            </p>
          </fieldset>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-900">
              가격 범위 <span className="font-normal text-gray-500">(선택)</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                value={minInput}
                onChange={(e) => setMinInput(formatPriceInput(e.target.value))}
                inputMode="numeric"
                placeholder="최소 (원)"
                aria-label="최소 가격"
                className={inputClass}
              />
              <span className="text-gray-500">~</span>
              <input
                value={maxInput}
                onChange={(e) => setMaxInput(formatPriceInput(e.target.value))}
                inputMode="numeric"
                placeholder="최대 (원)"
                aria-label="최대 가격"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-gray-500">
              비워두면 가격 상관없이 알려드려요. 가격을 못 읽은 글도 알려드려요.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-900">
              빼고 싶은 단어 <span className="font-normal text-gray-500">(선택)</span>
            </span>
            <input
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              placeholder="예: 케이스, 필름"
              maxLength={220}
              className={inputClass}
            />
            <span className="text-xs text-gray-500">
              제목에 이 단어가 있으면 알리지 않아요. 여러 개는 쉼표로 구분해요.
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-500 text-fixed-900 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            저장
          </button>
        </form>
      </details>
    </li>
  );
};

export default KeywordItem;
