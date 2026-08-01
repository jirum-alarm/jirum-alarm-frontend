'use client';

import { useQuery } from '@tanstack/react-query';
import { useId } from 'react';

import { SettingQueries } from '@/entities/notification';

import { useUpdatePriceDropOnly } from '../../model/update-price-drop-only';

/**
 * "가격이 내려갔을 때만 알림 받기" 토글.
 *
 * 등록 시점 기준가보다 싸게 올라온 딜만 골라 보낸다(백엔드 `priceDropOnly`).
 * 별도 알림 종류가 아니라 키워드 알림의 필터라서 이 화면에 둔다.
 *
 * ponytail: 레포에 Switch primitive 가 없다. 새로 만들지 않고 기존
 * hidden checkbox + peer-checked 패턴(CategoriesCheckboxGroup)으로 스위치 모양만 낸다.
 * 토글이 여러 개 생기면 그때 primitive 로 승격.
 */
const PriceDropOnlyToggle = () => {
  const id = useId();
  const { data } = useQuery(SettingQueries.pushSetting());
  const { mutate, isPending } = useUpdatePriceDropOnly();

  const checked = data?.pushSetting?.priceDropOnly ?? false;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
      <label htmlFor={`price-drop-${id}`} className="cursor-pointer">
        <p className="text-sm font-medium text-gray-900">가격이 내려갔을 때만 알림 받기</p>
        <p className="mt-0.5 text-xs text-gray-500">
          등록했을 때보다 싸게 올라온 딜만 골라서 알려줘요
        </p>
      </label>

      <input
        id={`price-drop-${id}`}
        type="checkbox"
        className="peer hidden"
        checked={checked}
        disabled={isPending}
        onChange={(e) => mutate(e.target.checked)}
      />
      <label
        htmlFor={`price-drop-${id}`}
        aria-hidden
        className="peer-checked:bg-primary-500 relative h-6 w-10 shrink-0 cursor-pointer rounded-full bg-gray-300 transition-colors peer-disabled:opacity-50 peer-checked:[&>span]:translate-x-4"
      >
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
      </label>
    </div>
  );
};

export default PriceDropOnlyToggle;
