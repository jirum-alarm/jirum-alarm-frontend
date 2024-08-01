import { getClient } from '@/lib/client';
import { QueryRankingProducts } from '@/graphql';
import { IRankingProductsOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import JirumRankingSlider from './JirumRankingSlider';
import { getDayBefore } from '@/util/date';
import Link from 'next/link';
import { PAGE } from '@/constants/page';

const JirumRankingContainer = async () => {
  const { data } = await getClient().query<IRankingProductsOutput>({
    query: QueryRankingProducts,
    variables: {
      limit: 10,
      orderBy: ProductOrderType.COMMUNITY_RANKING,
      orderOption: OrderOptionType.DESC,
      startDate: getDayBefore(1),
    },
  });
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 pb-5 pt-2">
        <h2 className="text-lg font-semibold text-gray-900">지름알림 랭킹</h2>
        <Link className="text-sm text-gray-500" href={PAGE.TRENDING}>
          더보기
        </Link>
      </div>

      <JirumRankingSlider products={data} />
    </div>
  );
};

export default JirumRankingContainer;
