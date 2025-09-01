'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { isCoupangPartner } from '@/app/(desktop-ready)/products/[id]/utils/isCoupangPartner';

import { ProductQueries } from '@entities/product';

export default function NoticeProfitLink({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  if (isCoupangPartner(product.detailUrl)) {
    return null;
  }

  return (
    <section className="pc:relative pc:inset-0 pc:top-auto bg-gray-100">
      <div className="pc:flex pc:items-center pc:justify-center pc:gap-x-3 pc:pb-5 p-5 pb-8">
        <p className="pc:mb-0 mb-1 text-sm font-semibold text-gray-700">안내</p>
        <div className="pc:items-center flex text-sm text-gray-600">
          <span className="pc:mr-1 mr-2">•</span>
          <p>일부 링크는 제휴 마케팅이 적용되어 지름알림에 커미션이 지급될 수 있습니다.</p>
        </div>
      </div>
    </section>
  );
}
