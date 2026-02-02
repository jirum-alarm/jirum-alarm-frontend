'use client';

import { Suspense } from 'react';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';
import BackButton from '@/shared/ui/layout/BackButton';
import Link from '@/shared/ui/Link';

import ProductShareButton from './ProductShareButton';

export default function ProductDetailPageHeader({ productId }: { productId: number }) {
  const handleSearch = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.DETAIL,
    // });
  };

  return (
    <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5">
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
        <Suspense>
          <ProductShareButton productId={productId} />
        </Suspense>
      </div>
    </header>
  );
}
