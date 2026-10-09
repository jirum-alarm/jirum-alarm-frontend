'use client';

import { useEffect } from 'react';

import Chart from '@/components/Chart';
import RankList from '@/components/RankList';
import { ignoreLazyRejection } from '@/hooks/graphql/options';
import {
  useHotDealRatioStats,
  useHotDealTypeDistribution,
  useProductCountByCategory,
  useProductCountByProvider,
  useProductPriceDistribution,
  useProductRegistrationStats,
} from '@/hooks/graphql/stats';
import { labelOf } from '@/lib/labels';
import { toStatsDateRange } from '@/utils/date';

import ChartCard from './ChartCard';
import DateRangeFilter, { useStatsRange } from './DateRangeFilter';
import TrendCard, { axisDate } from './TrendCard';

const HOT_DEAL_TYPE_LABEL: Record<string, string> = {
  HOT_DEAL: '핫딜',
  SUPER_DEAL: '슈퍼딜',
  ULTRA_DEAL: '울트라딜',
};

const ProductStats = () => {
  const [range, setRange] = useStatsRange();
  const [fetchProductStats, { data: productData, loading: productLoading }] =
    useProductRegistrationStats();
  const [fetchHotDealRatio, { data: hotDealRatioData, loading: hotDealRatioLoading }] =
    useHotDealRatioStats();
  const [fetchHotDealType, { data: hotDealTypeData, loading: hotDealTypeLoading }] =
    useHotDealTypeDistribution();
  const [fetchPriceDistribution, { data: priceData, loading: priceLoading }] =
    useProductPriceDistribution();
  const { data: categoryData, loading: categoryLoading } = useProductCountByCategory();
  const { data: providerData, loading: providerLoading } = useProductCountByProvider();

  useEffect(() => {
    const variables = {
      ...toStatsDateRange(range.startDate, range.endDate),
      interval: range.interval,
    };
    fetchProductStats({ variables }).catch(ignoreLazyRejection);
    fetchHotDealRatio({ variables }).catch(ignoreLazyRejection);
    fetchHotDealType({ variables }).catch(ignoreLazyRejection);
    fetchPriceDistribution({ variables }).catch(ignoreLazyRejection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.startDate, range.endDate, range.interval]);

  const hotDealRatio = hotDealRatioData?.hotDealRatioStats ?? [];
  const hotDealTypes = hotDealTypeData?.hotDealTypeDistribution ?? [];
  const priceDistribution = priceData?.productPriceDistribution ?? [];
  const totalCount = hotDealRatio.reduce((acc, d) => acc + d.totalCount, 0);
  const hotCount = hotDealRatio.reduce((acc, d) => acc + d.hotDealCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter value={range} onChange={setRange} />

      <TrendCard
        title="신규 상품 등록"
        name="등록"
        loading={productLoading}
        rows={productData?.productRegistrationStats ?? []}
      />

      <ChartCard title="핫딜 비율" loading={hotDealRatioLoading}>
        <p className="text-2xl font-bold text-black dark:text-white">
          {totalCount > 0 ? `${((hotCount / totalCount) * 100).toFixed(1)}%` : '-'}
          <span className="ml-1 text-sm font-normal text-body">
            기간 전체 · {hotCount.toLocaleString()} / {totalCount.toLocaleString()}개
          </span>
        </p>
        <Chart
          type="line"
          categories={hotDealRatio.map((d) => axisDate(d.date))}
          colors={['#FB5454']}
          series={[
            { name: '핫딜 비율', data: hotDealRatio.map((d) => Math.round(d.ratio * 10) / 10) },
          ]}
          format={(v) => `${v}%`}
          options={{ yaxis: { min: 0, labels: { formatter: (v: number) => `${Math.round(v)}%` } } }}
        />
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="핫딜 유형" loading={hotDealTypeLoading}>
          <Chart
            type="donut"
            height={240}
            categories={hotDealTypes.map((d) => labelOf(HOT_DEAL_TYPE_LABEL, d.hotDealType))}
            colors={['#3C50E0', '#80CAEE', '#10B981', '#FB5454']}
            series={hotDealTypes.map((d) => d.count)}
          />
        </ChartCard>

        <ChartCard title="가격대" loading={priceLoading}>
          <Chart
            type="bar"
            categories={priceDistribution.map((d) => d.priceRange)}
            colors={['#80CAEE']}
            series={[{ name: '상품', data: priceDistribution.map((d) => d.count) }]}
            options={{ xaxis: { tickAmount: undefined } }}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="카테고리별 상품 수" loading={categoryLoading}>
          <RankList
            items={(categoryData?.productCountByCategory ?? []).map((c) => ({
              label: c.categoryName,
              value: c.count,
            }))}
          />
        </ChartCard>

        <ChartCard title="커뮤니티별 상품 수" loading={providerLoading}>
          <RankList
            color="#10B981"
            items={(providerData?.productCountByProvider ?? []).map((p) => ({
              label: p.providerName,
              value: p.count,
            }))}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default ProductStats;
