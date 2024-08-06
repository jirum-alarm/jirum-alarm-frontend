import { getClient } from '@/lib/client';
import { QueryRankingProducts } from '@/graphql';
import { IRankingProductsOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import { getDayBefore } from '@/util/date';
import JirumRankingSlider from './JirumRankingSlider';

const JrimRankingSliderServer = async () => {
  const { data } = await getClient().query<IRankingProductsOutput>({
    query: QueryRankingProducts,
    variables: {
      limit: 10,
      orderBy: ProductOrderType.COMMUNITY_RANKING,
      orderOption: OrderOptionType.DESC,
      startDate: getDayBefore(1),
    },
  });
  return <JirumRankingSlider products={data} />;
};

export default JrimRankingSliderServer;
