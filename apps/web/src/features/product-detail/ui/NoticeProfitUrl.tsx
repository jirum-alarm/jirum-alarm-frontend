'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';

import { isCoupangPartner } from '../lib/isCoupangPartner';

export default function NoticeProfitLink({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  if (isCoupangPartner(product.mallName)) {
    return null;
  }

  return (
    <section className="pc:relative pc:inset-0 pc:top-auto bg-gray-100">
      <div className="pc:flex pc:items-center pc:justify-center pc:gap-x-3 pc:pb-5 p-5 pb-8">
        <p className="pc:mb-0 mb-1 text-sm font-semibold text-gray-700">안내</p>
        <div className="pc:items-center flex text-sm text-gray-600">
          <p>일부 링크는 제휴 링크예요. 이 링크로 사면 지름알림이 수수료를 받을 수 있어요.</p>
        </div>
      </div>
    </section>
  );
}
