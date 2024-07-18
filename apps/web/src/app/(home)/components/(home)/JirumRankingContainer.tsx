import JirumRankingSlider from './JirumRankingSlider';
import { getClient } from '@/lib/client';
import { QueryProductsRanking } from '@/graphql';
import { IProductsRankingOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import dayjs from 'dayjs';
import 'swiper/css';

const JirumRankingContainer = async () => {
  const { data } = await getClient().query<IProductsRankingOutput>({
    query: QueryProductsRanking,
    variables: {
      limit: 10,
      orderBy: ProductOrderType.COMMUNITY_RANKING,
      orderOption: OrderOptionType.DESC,
      startDate: dayjs().add(-1, 'day').toDate(),
    },
  });
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 pb-5 pt-2">
        <h2 className="text-lg font-semibold text-gray-900">지름알림 랭킹</h2>
        <span className="text-sm text-gray-500">더보기</span>
      </div>
      <JirumRankingSlider products={data} />
    </div>
  );
};

export default JirumRankingContainer;
