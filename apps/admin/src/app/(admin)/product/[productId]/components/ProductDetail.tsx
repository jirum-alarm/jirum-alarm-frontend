'use client';

import Link from 'next/link';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useGetProduct } from '@/hooks/graphql/product';
import { dateFormatter } from '@/utils/date';

const ProductDetail = ({ productId }: { productId: string }) => {
  const { data, loading } = useGetProduct({ id: Number(productId) });
  const product = data?.product;

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-60 items-center justify-center text-bodydark2">
        상품을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 기본 정보 */}
      <Panel className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">기본 정보</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-48 w-48 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <InfoRow label="ID" value={String(product.id)} />
            <InfoRow label="제목" value={product.title} />
            <InfoRow
              label="가격"
              value={product.price ? `${product.price.toLocaleString()}원` : '-'}
            />
            <InfoRow label="카테고리" value={product.categoryName || product.category || '-'} />
            <InfoRow label="출처" value={product.provider?.nameKr ?? '-'} />
            <InfoRow label="몰" value={product.mallName || '-'} />
            <InfoRow
              label="등록일"
              value={product.postedAt ? dateFormatter(product.postedAt) : '-'}
            />
            <InfoRow label="작성자" value={product.author?.nickname ?? '-'} />
          </div>
        </div>
      </Panel>

      {/* 상태 */}
      <Panel className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">상태 및 통계</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <StatCard
            label="핫딜"
            value={product.isHot ? '핫딜' : '일반'}
            color={product.isHot ? 'text-success' : 'text-bodydark2'}
          />
          <StatCard
            label="판매 상태"
            value={product.isEnd ? '종료' : '판매중'}
            color={product.isEnd ? 'text-danger' : 'text-success'}
          />
          <StatCard label="조회수" value={product.viewCount.toLocaleString()} />
          <StatCard label="위시리스트" value={product.wishlistCount.toLocaleString()} />
          <StatCard label="좋아요" value={product.likeCount.toLocaleString()} />
          <StatCard label="싫어요" value={product.dislikeCount.toLocaleString()} />
          <StatCard
            label="긍정 반응"
            value={product.positiveCommunityReactionCount.toLocaleString()}
            color="text-success"
          />
          <StatCard
            label="부정 반응"
            value={product.negativeCommunityReactionCount.toLocaleString()}
            color="text-danger"
          />
        </div>
      </Panel>

      {/* 핫딜 지수 */}
      {product.hotDealIndex && (
        <Panel className="p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">핫딜 지수</h3>
          <p className="mb-4 text-sm text-bodydark2">{product.hotDealIndex.message}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="현재가"
              value={`${product.hotDealIndex.currentPrice.toLocaleString()}원`}
            />
            <StatCard
              label="최저가"
              value={`${product.hotDealIndex.lowestPrice.toLocaleString()}원`}
              color="text-success"
            />
            <StatCard
              label="최고가"
              value={`${product.hotDealIndex.highestPrice.toLocaleString()}원`}
              color="text-danger"
            />
          </div>
        </Panel>
      )}

      {/* 가격 이력 */}
      {product.prices && product.prices.length > 0 && (
        <Panel className="p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">가격 이력</h3>
          <div className="overflow-x-auto">
            <table className="table-cards w-full table-auto md:whitespace-nowrap">
              <thead>
                <tr className="bg-gray-2 dark:bg-meta-4">
                  <th className="px-4 py-3 text-left text-sm font-medium text-bodydark2">출처</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-bodydark2">타입</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-bodydark2">가격</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-bodydark2">날짜</th>
                </tr>
              </thead>
              <tbody>
                {product.prices.map((price) => (
                  <tr key={price.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-3 text-sm font-medium text-black dark:text-white md:font-normal">
                      {price.target}
                    </td>
                    <td data-label="타입" className="px-4 py-3 text-sm text-bodydark2">
                      {price.type}
                    </td>
                    <td
                      data-label="가격"
                      className="px-4 py-3 text-right text-sm text-black dark:text-white"
                    >
                      {price.price.toLocaleString()}원
                    </td>
                    <td data-label="날짜" className="px-4 py-3 text-right text-xs text-bodydark2">
                      {dateFormatter(price.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* 링크 */}
      <Panel className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">링크</h3>
        <div className="flex flex-col gap-2">
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              원본 URL
            </a>
          )}
          {product.detailUrl && (
            <a
              href={product.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              상세 URL
            </a>
          )}
        </div>
      </Panel>

      <div>
        <Link
          href="/product/list"
          className="hover:bg-gray-1 inline-block rounded-lg border border-stroke px-6 py-2 text-sm font-medium text-bodydark2 transition dark:border-strokedark dark:hover:bg-meta-4"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-20 shrink-0 text-sm font-medium text-bodydark2">{label}</span>
      <span className="min-w-0 break-words text-sm text-black dark:text-white">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'text-black dark:text-white',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
      <p className="text-xs text-bodydark2">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default ProductDetail;
