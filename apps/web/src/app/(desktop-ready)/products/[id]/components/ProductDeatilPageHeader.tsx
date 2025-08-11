'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { Search } from '@/components/common/icons';
import LogoLink from '@/components/common/Logo/LogoLink';
import BackButton from '@/components/layout/BackButton';
import { PAGE } from '@/constants/page';

import Link from '@shared/ui/Link';
import ShareButton from '@shared/ui/ShareButton';

import { ProductQueries } from '@entities/product';

export default function ProductDetailPageHeader({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  if (!product) {
    notFound();
  }

  const title = `${product.title} | 지름알림`;

  const handleSearch = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.DETAIL,
    // });
  };

  return (
    <header className="fixed top-0 z-50 flex h-[56px] w-full max-w-screen-mobile-max items-center justify-between border-b border-gray-100 bg-white px-5">
      <div className="flex items-center gap-x-1">
        <BackButton backTo={PAGE.HOME} />
        <LogoLink />
      </div>
      <div className="flex items-center gap-x-4">
        <Link
          href={PAGE.SEARCH}
          onClick={handleSearch}
          aria-label="검색"
          title="검색"
          className="-m-2 p-2"
        >
          <Search />
        </Link>
        <ShareButton title={title} page="DETAIL" />
      </div>
    </header>
  );
}
