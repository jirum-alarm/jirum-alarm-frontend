'use client';

import { useId } from 'react';

import { useUpdateKeywordPriceDropOnly } from '../../model/update-price-drop-only';

/**
 * 키워드 한 줄에 붙는 "가격 내려가면" 토글.
 *
 * 유저 전역이 아니라 **키워드별** 설정이다 — "삼다수는 싸질 때만, 노트북은 전부"를
 * 표현할 수 있어야 하고, 기준가(basePrice)도 키워드별로 저장된다.
 *
 * ponytail: 레포에 Switch primitive 가 없다. 새로 만들지 않고 hidden checkbox +
 * peer-checked 패턴(CategoriesCheckboxGroup)으로 스위치 모양만 낸다.
 */
const PriceDropOnlyToggle = ({
  keywordId,
  priceDropOnly,
}: {
  keywordId: number;
  priceDropOnly: boolean;
}) => {
  const id = useId();
  const { mutate, isPending } = useUpdateKeywordPriceDropOnly();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <label htmlFor={`drop-${id}`} className="cursor-pointer text-xs text-gray-500">
        가격 내려가면
      </label>
      <input
        id={`drop-${id}`}
        type="checkbox"
        className="peer hidden"
        checked={priceDropOnly}
        disabled={isPending}
        onChange={(e) => mutate({ id: keywordId, priceDropOnly: e.target.checked })}
      />
      <label
        htmlFor={`drop-${id}`}
        aria-label="가격 내려갔을 때만 알림 받기"
        className="peer-checked:bg-primary-500 relative h-5 w-9 shrink-0 cursor-pointer rounded-full bg-gray-300 transition-colors peer-disabled:opacity-50 peer-checked:[&>span]:translate-x-4"
      >
        <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" />
      </label>
    </div>
  );
};

export default PriceDropOnlyToggle;
