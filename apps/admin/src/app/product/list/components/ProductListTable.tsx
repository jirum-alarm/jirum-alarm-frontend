'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

import { type GetProductsVariables, useGetProducts } from '@/hooks/graphql/product';
import { dateFormatter } from '@/utils/date';

import ProductFilters from './ProductFilters';

const ProductListTable = () => {
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [isEnd, setIsEnd] = useState<boolean | undefined>(undefined);
  const [isHot, setIsHot] = useState<boolean | undefined>(undefined);
  const [searchVariables, setSearchVariables] = useState<GetProductsVariables>({});
  const [, startTransition] = useTransition();

  const { data, loading, fetchMore } = useGetProducts(searchVariables);
  const products = data?.products ?? [];

  const handleSearch = () => {
    setSearchVariables({
      keyword: keyword || undefined,
      categoryId,
      isEnd,
      isHot,
    });
  };

  const { ref: viewRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!inView || loading || products.length === 0) return;
      const searchAfter = products[products.length - 1]?.searchAfter;
      if (!searchAfter) return;
      startTransition(() => {
        fetchMore({
          variables: { ...searchVariables, searchAfter },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              products: [...prev.products, ...fetchMoreResult.products],
            };
          },
        });
      });
    },
  });

  return (
    <>
      <ProductFilters
        keyword={keyword}
        categoryId={categoryId}
        isEnd={isEnd}
        isHot={isHot}
        onChangeKeyword={setKeyword}
        onChangeCategoryId={setCategoryId}
        onChangeIsEnd={setIsEnd}
        onChangeIsHot={setIsHot}
        onSearch={handleSearch}
      />

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="w-16 px-4 py-4 text-center text-sm font-medium text-bodydark2">ID</th>
              <th className="min-w-[60px] px-4 py-4 text-center text-sm font-medium text-bodydark2">
                이미지
              </th>
              <th className="min-w-[200px] px-4 py-4 text-sm font-medium text-bodydark2">제목</th>
              <th className="w-24 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                가격
              </th>
              <th className="w-24 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                출처
              </th>
              <th className="w-20 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                상태
              </th>
              <th className="w-24 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                등록일
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-1 border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4"
              >
                <td className="px-4 py-3 text-center text-sm text-black dark:text-white">
                  {product.id}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="mx-auto h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="mx-auto h-10 w-10 rounded bg-gray-2 dark:bg-meta-4" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/product/${product.id}`}
                    className="line-clamp-1 text-sm text-black hover:text-primary dark:text-white"
                  >
                    {product.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center text-sm text-black dark:text-white">
                  {product.price ? `${product.price.toLocaleString()}원` : '-'}
                </td>
                <td className="px-4 py-3 text-center text-sm text-bodydark2">
                  {product.provider?.nameKr ?? '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.isEnd ? (
                    <span className="inline-block rounded bg-danger bg-opacity-10 px-2 py-1 text-xs font-medium text-danger">
                      종료
                    </span>
                  ) : product.isHot ? (
                    <span className="inline-block rounded bg-success bg-opacity-10 px-2 py-1 text-xs font-medium text-success">
                      핫딜
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-bodydark2 bg-opacity-10 px-2 py-1 text-xs font-medium text-bodydark2">
                      일반
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-xs text-bodydark2">
                  {product.postedAt ? dateFormatter(product.postedAt) : '-'}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && products.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-bodydark2">검색 결과가 없습니다.</div>
        )}

        <div ref={viewRef} className="h-4" />
      </div>
    </>
  );
};

export default ProductListTable;
