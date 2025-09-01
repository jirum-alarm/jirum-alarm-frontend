'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@entities/product';

import { isCoupangPartner } from '../utils/isCoupangPartner';

export default function CoupangPartnerGuide({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  if (!isCoupangPartner(product.mallName)) {
    return null;
  }

  return (
    <div className="pc:rounded-xl flex h-12 items-center justify-start gap-3 self-stretch bg-gray-100 px-3.5 py-3.5">
      <div className="justify-start text-xs leading-none font-medium text-slate-700">안내</div>
      <div className="flex-1 justify-start text-xs leading-none font-normal text-slate-600">
        쿠팡 파트너스 활동으로 지름알림에 일정 금액의 수수료가 지급될 수 있습니다.
      </div>
    </div>
  );
}
