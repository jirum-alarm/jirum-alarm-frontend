'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import {
  useHotDealRatioStats,
  useHotDealTypeDistribution,
  useProductCountByCategory,
  useProductCountByProvider,
  useProductPriceDistribution,
  useProductRegistrationStats,
} from '@/hooks/graphql/stats';
import { DateInterval } from '@/types/stats';
import { formatStatsDate } from '@/utils/date';

import ChartCard from './ChartCard';
import DateRangeFilter from './DateRangeFilter';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const ProductStats = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [interval, setInterval] = useState<DateInterval>(DateInterval.DAILY);

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

  const handleSearch = () => {
    const variables = { startDate, endDate, interval };
    fetchProductStats({ variables });
    fetchHotDealRatio({ variables });
    fetchHotDealType({ variables });
    fetchPriceDistribution({ variables });
  };

  const productStats = productData?.productRegistrationStats ?? [];
  const hotDealRatio = hotDealRatioData?.hotDealRatioStats ?? [];
  const hotDealTypes = hotDealTypeData?.hotDealTypeDistribution ?? [];
  const categories = categoryData?.productCountByCategory ?? [];
  const providers = providerData?.productCountByProvider ?? [];
  const priceDistribution = priceData?.productPriceDistribution ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        interval={interval}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeInterval={setInterval}
        onSearch={handleSearch}
      />

      <ChartCard title="신규 상품 등록 수" loading={productLoading}>
        {productStats.length > 0 ? (
          <Chart
            type="line"
            height={350}
            options={{
              chart: { toolbar: { show: true } },
              xaxis: {
                categories: productStats.map((d) => formatStatsDate(d.date)),
                labels: { rotate: -45 },
              },
              yaxis: { title: { text: '등록 수' } },
              stroke: { curve: 'smooth', width: 2 },
              colors: ['#3C50E0'],
            }}
            series={[
              {
                name: '등록 수',
                data: productStats.map((d) => d.count),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>
        )}
      </ChartCard>

      <ChartCard title="핫딜 비율 추이" loading={hotDealRatioLoading}>
        {hotDealRatio.length > 0 ? (
          <Chart
            type="line"
            height={350}
            options={{
              chart: { toolbar: { show: true } },
              xaxis: {
                categories: hotDealRatio.map((d) => formatStatsDate(d.date)),
                labels: { rotate: -45 },
              },
              yaxis: [
                { title: { text: '상품 수' } },
                {
                  opposite: true,
                  title: { text: '비율 (%)' },
                  max: 100,
                },
              ],
              stroke: { curve: 'smooth', width: 2 },
              colors: ['#3C50E0', '#FB5454', '#10B981'],
            }}
            series={[
              {
                name: '전체 상품',
                data: hotDealRatio.map((d) => d.totalCount),
              },
              {
                name: '핫딜 상품',
                data: hotDealRatio.map((d) => d.hotDealCount),
              },
              {
                name: '핫딜 비율 (%)',
                data: hotDealRatio.map((d) => Math.round(d.ratio * 100) / 100),
              },
            ]}
          />
        ) : (
          <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="핫딜 유형별 분포" loading={hotDealTypeLoading}>
          {hotDealTypes.length > 0 ? (
            <Chart
              type="donut"
              height={300}
              options={{
                labels: hotDealTypes.map((d) => d.hotDealType),
                colors: ['#3C50E0', '#80CAEE', '#10B981', '#FB5454'],
                legend: { position: 'bottom' },
              }}
              series={hotDealTypes.map((d) => d.count)}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>
          )}
        </ChartCard>

        <ChartCard title="가격대별 분포" loading={priceLoading}>
          {priceDistribution.length > 0 ? (
            <Chart
              type="bar"
              height={300}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: priceDistribution.map((d) => d.priceRange),
                },
                yaxis: { title: { text: '상품 수' } },
                colors: ['#80CAEE'],
                plotOptions: {
                  bar: { borderRadius: 4, columnWidth: '60%' },
                },
              }}
              series={[
                {
                  name: '상품 수',
                  data: priceDistribution.map((d) => d.count),
                },
              ]}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">조회 버튼을 눌러 데이터를 불러오세요.</p>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="카테고리별 상품 수" loading={categoryLoading}>
          {categories.length > 0 ? (
            <Chart
              type="bar"
              height={350}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: categories.map((c) => c.categoryName),
                  labels: { rotate: -45 },
                },
                yaxis: { title: { text: '상품 수' } },
                colors: ['#3C50E0'],
                plotOptions: {
                  bar: { borderRadius: 4, columnWidth: '60%' },
                },
              }}
              series={[
                {
                  name: '상품 수',
                  data: categories.map((c) => c.count),
                },
              ]}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
          )}
        </ChartCard>

        <ChartCard title="제공자별 상품 수" loading={providerLoading}>
          {providers.length > 0 ? (
            <Chart
              type="bar"
              height={350}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: providers.map((p) => p.providerName),
                  labels: { rotate: -45 },
                },
                yaxis: { title: { text: '상품 수' } },
                colors: ['#10B981'],
                plotOptions: {
                  bar: { borderRadius: 4, columnWidth: '60%' },
                },
              }}
              series={[
                {
                  name: '상품 수',
                  data: providers.map((p) => p.count),
                },
              ]}
            />
          ) : (
            <p className="py-8 text-center text-bodydark2">데이터가 없습니다.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default ProductStats;
