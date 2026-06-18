'use client';

import { useQuery } from '@tanstack/react-query';
import { VisuallyHidden } from 'radix-ui';
import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product/product.service';
import { getRecentViewedProducts } from '@/shared/lib/recentViewedProducts';
import Close from '@/shared/ui/common/icons/Close';

import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

import { TaggedProduct } from '../model/usePostForm';

const DEFAULT_RECENT_LIMIT = 5;

export default function ProductTagModal({
  selected,
  onSelect,
  onClear,
}: {
  selected: TaggedProduct | null;
  onSelect: (product: TaggedProduct) => void;
  onClear: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [recentProducts, setRecentProducts] = useState<TaggedProduct[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const recent = getRecentViewedProducts()
      .slice(0, DEFAULT_RECENT_LIMIT)
      .map((p) => ({
        id: p.id,
        title: p.title,
        thumbnail: p.thumbnail ?? undefined,
        price: p.price ?? undefined,
      }));
    setRecentProducts(recent);
  }, [isOpen]);

  const { data, isFetching } = useQuery({
    queryKey: ['product-tag-search', keyword],
    queryFn: () =>
      ProductService.getProducts({
        limit: 20,
        keyword,
        orderBy: ProductOrderType.PostedAt,
        orderOption: OrderOptionType.Desc,
      }).then((res) => res ?? { products: [] }),
    enabled: keyword.length > 0,
  });

  const searchResults = data?.products ?? [];
  const showRecent = !keyword;

  const handleSearch = () => {
    setKeyword(inputValue.trim());
  };

  const handleSelect = (product: TaggedProduct) => {
    onSelect(product);
    setIsOpen(false);
    setKeyword('');
    setInputValue('');
  };

  const handleSelectFromSearch = (p: (typeof searchResults)[number]) => {
    handleSelect({
      id: Number(p.id),
      title: p.title,
      thumbnail: p.thumbnail ?? undefined,
      price: p.price ?? undefined,
    });
  };

  return (
    <>
      {selected ? (
        <div className="bg-surface-subtle flex items-center gap-x-3 rounded-xl p-3">
          {selected.thumbnail && (
            <div className="bg-surface-emphasis relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
              <ProductThumbnail
                src={selected.thumbnail}
                alt={selected.title}
                title={selected.title}
                type="product"
                sizes="48px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="typography-body-14m text-fg-primary truncate">{selected.title}</p>
            {selected.price && (
              <p className="text-fg-secondary-strong mt-0.5 text-xs font-semibold">
                {selected.price}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-fg-tertiary flex-shrink-0 p-1 transition-transform active:scale-95"
            aria-label="태그 제거"
          >
            <Close width={16} height={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-fg-secondary typography-body-14r flex items-center gap-x-2 transition-transform active:scale-95"
        >
          <span className="text-fg-tertiary flex h-6 w-6 items-center justify-center rounded-full border border-gray-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2v8M2 6h8" strokeLinecap="round" />
            </svg>
          </span>
          <span>상품 태그</span>
        </button>
      )}

      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <VisuallyHidden.Root>
            <Drawer.Title>상품 태그</Drawer.Title>
          </VisuallyHidden.Root>
          <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
          <Drawer.Content className="max-w-mobile-max rounded-t-5 bg-surface-default fixed inset-x-0 bottom-0 z-[9999] mx-auto flex h-[88vh] flex-col outline-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="typography-title-16sb text-fg-primary">상품 태그</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-fg-tertiary p-1 transition-transform active:scale-95"
              >
                <Close width={20} height={20} />
              </button>
            </div>

            {/* 검색바 */}
            <div className="px-5 pb-4">
              <div className="bg-surface-muted flex items-center gap-x-2 rounded-xl px-3 py-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                >
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5 14 14" strokeLinecap="round" />
                </svg>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                    if (e.key === 'Escape' && keyword) {
                      setKeyword('');
                      setInputValue('');
                    }
                  }}
                  placeholder="핫딜 제품을 검색해 주세요"
                  className="text-fg-primary typography-body-14r flex-1 bg-transparent placeholder-gray-400 outline-none"
                />
                {inputValue && (
                  <button
                    onClick={() => {
                      setInputValue('');
                      setKeyword('');
                    }}
                    className="text-fg-tertiary transition-transform active:scale-95"
                  >
                    <Close width={14} height={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 overflow-y-auto px-5">
              {/* 검색 결과 */}
              {keyword && (
                <>
                  {isFetching && (
                    <div className="text-fg-tertiary typography-body-14r flex justify-center py-10">
                      검색 중...
                    </div>
                  )}
                  {!isFetching && searchResults.length === 0 && (
                    <div className="text-fg-tertiary typography-body-14r flex justify-center py-10">
                      검색 결과가 없어요.
                    </div>
                  )}
                  {!isFetching && searchResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 pb-6">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectFromSearch(p)}
                          className="flex flex-col text-left transition-transform active:scale-[0.98]"
                        >
                          <div className="bg-surface-muted relative aspect-square w-full overflow-hidden rounded-xl">
                            {p.thumbnail && (
                              <ProductThumbnail
                                src={p.thumbnail}
                                alt={p.title}
                                title={p.title}
                                type="product"
                                sizes="30vw"
                              />
                            )}
                          </div>
                          <p className="text-fg-primary mt-1.5 line-clamp-2 text-xs leading-tight">
                            {p.title}
                          </p>
                          {p.price && (
                            <p className="text-fg-secondary-strong mt-0.5 text-xs font-semibold">
                              {p.price}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* 최근 선택 상품 */}
              {showRecent && (
                <>
                  {recentProducts.length > 0 ? (
                    <>
                      <p className="typography-body-14sb text-fg-secondary-strong mb-3">
                        최근 본 상품
                      </p>
                      <div className="grid grid-cols-3 gap-3 pb-6">
                        {recentProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className="flex flex-col text-left transition-transform active:scale-[0.98]"
                          >
                            <div className="bg-surface-muted relative aspect-square w-full overflow-hidden rounded-xl">
                              {p.thumbnail && (
                                <ProductThumbnail
                                  src={p.thumbnail}
                                  alt={p.title}
                                  title={p.title}
                                  type="product"
                                  sizes="30vw"
                                />
                              )}
                            </div>
                            <p className="text-fg-primary mt-1.5 line-clamp-2 text-xs leading-tight">
                              {p.title}
                            </p>
                            {p.price && (
                              <p className="text-fg-secondary-strong mt-0.5 text-xs font-semibold">
                                {p.price}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-fg-tertiary flex flex-col items-center justify-center py-16">
                      <p className="typography-body-14r">검색어를 입력해 상품을 찾아보세요</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
