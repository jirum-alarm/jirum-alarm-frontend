'use client';
import BasicLayout from '@/components/layout/BasicLayout';
import { ProductQueries } from '@/entities/product';
import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

const LikePage = () => {
  const { data } = useQuery(
    ProductQueries.wishlistsServer({
      orderBy: WishlistOrderType.Id,
      orderOption: OrderOptionType.Desc,
      limit: 10,
    }),
  );
  console.log('dat : ', data);
  return (
    <BasicLayout hasBackButton title="찜 목록">
      <div className="flex h-full flex-col px-5 pb-9 pt-3">
        <div className="pb-3 text-sm">
          전체 <span className="font-semibold">6</span>개
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <div className="h-[246px] w-[162px] bg-gray-100"></div>
          <div className="h-[246px] w-[162px] bg-gray-100"></div>
          <div className="h-[246px] w-[162px] bg-gray-100"></div>
          <div className="h-[246px] w-[162px] bg-gray-100"></div>
          <div className="h-[246px] w-[162px] bg-gray-100"></div>
          <div className="h-[246px] w-[162px] bg-gray-100"></div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default LikePage;
