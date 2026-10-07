'use client';

import { useRef, useState } from 'react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { trackAlarmLink } from '@/shared/lib/trackAlarmLink';
import { ArrowDown } from '@/shared/ui/common/icons';
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
  {
    value: false,
    label: '새 핫딜 모두',
    hint: (k: string) => `‘${k}’ 핫딜이 올라올 때마다 알려드려요`,
  },
  {
    value: true,
    label: '평소보다 쌀 때만',
    hint: () => '평소 가격보다 싸게 올라온 딜만 알려드려요',
  },
] as const;

const sectionTitle = 'text-sm font-semibold text-gray-900';

/**
 * 키워드 카드 한 장. 접힌 상태엔 "어떤 알림이 오는지" 한 줄 요약만, 누르면 설정이 펼쳐진다.
 *
 * 설정 3개(받을 딜·가격 범위·제외 단어)는 저장 버튼 하나로 같이 저장한다 — 예전엔 "가격 하락
 * 알림" 스위치는 즉시 저장, "알림 조건"은 버튼 저장이라 같은 줄에서 저장 방식이 갈렸다.
 * 제외 단어는 키워드가 제목 부분일치라 생기는 오탐("콜라" → "콜라겐 마스크팩", 2026-10-01 실측
 * 커뮤니티 딜의 ~15%)을 유저가 끄는 용도.
 *
 * 2026-10-08 개편: 선택 표시가 라임 테두리(흰 바탕 대비 1.3:1)라 뭐가 골라졌는지 안 보였다 →
 * 라디오 점 + 짙은 테두리. 헤더의 X 가 "닫기"로 읽혀 펼침과 헷갈렸다 → 삭제는 펼친 안쪽으로.
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
        <summary className="flex cursor-pointer list-none items-center gap-2 py-3.5 pr-2 pl-4 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{keyword.keyword}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {summarizeKeywordAlert(keyword)}
            </p>
          </div>
          <ArrowDown
            width={20}
            height={20}
            color="var(--color-gray-500)"
            aria-hidden
            className="mr-2 shrink-0 transition-transform group-open:rotate-180"
          />
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
            <legend className={cn(sectionTitle, 'mb-2')}>어떤 딜을 알려드릴까요?</legend>
            <div className="pc:grid-cols-2 grid gap-2">
              {DEAL_CHOICES.map((choice) => {
                const selected = priceDropOnly === choice.value;
                return (
                  <label
                    key={choice.label}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 has-focus-visible:ring-2 has-focus-visible:ring-gray-400',
                      selected ? 'border-gray-900' : 'border-gray-200',
                    )}
                  >
                    <input
                      type="radio"
                      name={`deal-${keyword.id}`}
                      className="sr-only"
                      checked={selected}
                      onChange={() => setPriceDropOnly(choice.value)}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2',
                        selected ? 'border-gray-900' : 'border-gray-300',
                      )}
                    >
                      {selected && <span className="size-2 rounded-full bg-gray-900" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">
                        {choice.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {choice.hint(keyword.keyword)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <span className={sectionTitle}>
              가격 범위 <span className="text-xs font-normal text-gray-500">(선택)</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                value={minInput}
                onChange={(e) => setMinInput(formatPriceInput(e.target.value))}
                inputMode="numeric"
                placeholder="최소 금액"
                aria-label="최소 가격"
                className={inputClass}
              />
              <span className="text-gray-500">~</span>
              <input
                value={maxInput}
                onChange={(e) => setMaxInput(formatPriceInput(e.target.value))}
                inputMode="numeric"
                placeholder="최대 금액"
                aria-label="최대 가격"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-gray-500">
              비워 두면 가격과 상관없이 알려드려요. 가격이 안 적힌 글도 알려드려요.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className={sectionTitle}>
              빼고 싶은 단어 <span className="text-xs font-normal text-gray-500">(선택)</span>
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

          <div className="pc:justify-end flex items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700"
              aria-label={`${keyword.keyword} 키워드 삭제`}
            >
              키워드 삭제
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary-500 text-fixed-900 pc:flex-none pc:w-32 flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </form>
      </details>
    </li>
  );
};

export default KeywordItem;
