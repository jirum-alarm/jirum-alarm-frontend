'use client';

import Link from 'next/link';

import { useGetProducts } from '@/hooks/graphql/product';
import { dateFormatter } from '@/utils/date';

const RecentProducts = () => {
  const { data, loading } = useGetProducts({ limit: 10 });
  const products = data?.products ?? [];

  return (
    <div className="rounded-lg border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">최근 등록 상품</h4>
        <Link href="/product/list" className="text-sm font-medium text-primary hover:underline">
          전체보기
        </Link>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="grid grid-cols-[60px_1fr_100px_100px_80px] rounded-sm bg-gray-2 dark:bg-meta-4">
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase text-bodydark2">ID</h5>
            </div>
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase text-bodydark2">제목</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase text-bodydark2">가격</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase text-bodydark2">출처</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase text-bodydark2">등록일</h5>
            </div>
          </div>

          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="hover:bg-gray-1 grid grid-cols-[60px_1fr_100px_100px_80px] border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4"
            >
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-sm text-black dark:text-white">{product.id}</p>
              </div>
              <div className="flex items-center p-2.5 xl:p-5">
                <p className="line-clamp-1 text-sm text-black dark:text-white">{product.title}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-sm text-black dark:text-white">
                  {product.price ? `${product.price.toLocaleString()}원` : '-'}
                </p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-sm text-bodydark2">{product.provider?.nameKr ?? '-'}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-xs text-bodydark2">
                  {product.postedAt ? dateFormatter(product.postedAt) : '-'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentProducts;
