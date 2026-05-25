'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

import { QueryProducts } from '@/graphql/product';
import {
  type GetProductsVariables,
  useGetProduct,
  useGetProducts,
  useHardDeleteProductByAdmin,
} from '@/hooks/graphql/product';
import { dateFormatter } from '@/utils/date';

import ProductFilters from './ProductFilters';

const ProductListTable = () => {
  const [productId, setProductId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [isEnd, setIsEnd] = useState<boolean | undefined>(undefined);
  const [isHot, setIsHot] = useState<boolean | undefined>(undefined);
  const [searchVariables, setSearchVariables] = useState<GetProductsVariables>({});
  const [searchProductId, setSearchProductId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const {
    data: listData,
    loading: listLoading,
    fetchMore,
  } = useGetProducts(searchVariables, {
    skip: searchProductId !== null,
  });
  const { data: singleData, loading: singleLoading } = useGetProduct(
    { id: searchProductId ?? 0 },
    { skip: searchProductId === null },
  );

  const isSingleMode = searchProductId !== null;
  const loading = isSingleMode ? singleLoading : listLoading;
  const products = isSingleMode
    ? singleData?.product
      ? [
          {
            id: singleData.product.id,
            title: singleData.product.title,
            mallId: singleData.product.mallId,
            url: singleData.product.url,
            isHot: singleData.product.isHot,
            isEnd: singleData.product.isEnd,
            price: singleData.product.price,
            providerId: singleData.product.providerId,
            categoryId: singleData.product.categoryId,
            category: singleData.product.category,
            thumbnail: singleData.product.thumbnail,
            hotDealType: singleData.product.hotDealType,
            provider: singleData.product.provider
              ? { nameKr: singleData.product.provider.nameKr }
              : null,
            searchAfter: [],
            postedAt: singleData.product.postedAt,
          },
        ]
      : []
    : (listData?.products ?? []);

  const [hardDelete, { loading: deleting }] = useHardDeleteProductByAdmin({
    refetchQueries: isSingleMode ? [] : [{ query: QueryProducts, variables: searchVariables }],
    awaitRefetchQueries: true,
  });

  const handleSearch = () => {
    setDeleteError(null);
    const idNum = productId.trim() ? Number(productId.trim()) : null;
    if (idNum !== null && Number.isFinite(idNum) && idNum > 0) {
      setSearchProductId(idNum);
      return;
    }
    setSearchProductId(null);
    setSearchVariables({
      keyword: keyword || undefined,
      categoryId,
      isEnd,
      isHot,
    });
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId === null) return;
    setDeleteError(null);
    try {
      await hardDelete({ variables: { id: Number(pendingDeleteId) } });
      if (isSingleMode) {
        setSearchProductId(null);
        setProductId('');
      }
      setPendingDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const { ref: viewRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (isSingleMode) return;
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
        productId={productId}
        keyword={keyword}
        categoryId={categoryId}
        isEnd={isEnd}
        isHot={isHot}
        onChangeProductId={setProductId}
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
              <th className="w-20 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                관리
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
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDeleteId(product.id);
                    }}
                    className="rounded-md border border-danger bg-transparent px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger hover:text-white"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && products.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-bodydark2">검색 결과가 없습니다.</div>
        )}

        {!isSingleMode && <div ref={viewRef} className="h-4" />}
      </div>

      {pendingDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-default dark:bg-boxdark">
            <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">상품 삭제</h3>
            <p className="mb-2 text-sm text-bodydark2">
              상품 ID{' '}
              <span className="font-semibold text-black dark:text-white">{pendingDeleteId}</span>{' '}
              을(를) 완전히 삭제합니다.
            </p>
            <p className="mb-4 text-sm text-danger">
              이 작업은 되돌릴 수 없으며, 관련 매핑/메타데이터/위시리스트/댓글이 모두 함께
              삭제됩니다.
            </p>
            {deleteError && (
              <p className="mb-3 rounded border border-danger bg-danger bg-opacity-10 px-3 py-2 text-xs text-danger">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingDeleteId(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="rounded-md border border-stroke px-4 py-2 text-sm text-black transition hover:bg-gray-2 disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductListTable;
