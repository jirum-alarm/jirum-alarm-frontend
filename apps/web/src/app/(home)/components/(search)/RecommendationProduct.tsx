'use client';

import { EVENT } from '@/constants/mixpanel';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import { IProduct } from '@/graphql/interface';

export default function RecommendationProduct({
  label,
  hotDeals,
  logging,
  nested = false,
}: {
  label?: string;
  hotDeals: IProduct[];
  logging: { page: keyof typeof EVENT.PAGE };
  nested?: boolean;
}) {
  return (
    <section>
      {label && (
        <div className="flex h-[56px] w-full items-center justify-between">
          <span className="font-bold text-gray-900">{label}</span>
        </div>
      )}
      <HorizontalProductCarousel
        products={hotDeals}
        type="hotDeal"
        logging={logging}
        maxItems={10}
        nested={nested}
      />
    </section>
  );
}
