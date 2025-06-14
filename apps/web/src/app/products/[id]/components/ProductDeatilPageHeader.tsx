'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { Search, Share } from '@/components/common/icons';
import { useToast } from '@/components/common/Toast';
import BackButton from '@/components/layout/BackButton';
import { PAGE } from '@/constants/page';
import { ProductQueries } from '@/entities/product';
import Link from '@/features/Link';

import LogoLink from '../../../../components/common/Logo/LogiLink';

export default function ProductDetailPageHeader({ productId }: { productId: number }) {
  const { toast } = useToast();

  const {
    data: { product },
  } = useSuspenseQuery(ProductQueries.product({ id: productId }));

  if (!product) notFound();

  const title = `${product.title} | 지름알림`;

  const handleSearch = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.DETAIL,
    // });
  };

  const handleShare = () => {
    if (navigator.share) {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SHARE.NAME, {
      //   type: EVENT.PRODUCT_SHARE.TYPE.SHARE_API,
      //   page: EVENT.PAGE.DETAIL,
      // });

      navigator.share({
        title,
        url: window.location.href,
      });
    } else {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SHARE.NAME, {
      //   type: EVENT.PRODUCT_SHARE.TYPE.NOT_SHARE_API,
      //   page: EVENT.PAGE.DETAIL,
      // });

      navigator.clipboard.writeText(window.location.href);
      toast(
        <>
          링크가 클립보드에 복사되었어요!
          <br />
          원하는 곳에 붙여 넣어 공유해보세요!
        </>,
      );
    }
  };

  return (
    <header className="fixed top-0 z-50 flex h-[56px] w-full max-w-screen-layout-max items-center justify-between border-b border-gray-100 bg-white px-5">
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
        <button
          onClick={handleShare}
          className="-m-2 p-2 hover:cursor-pointer"
          aria-label="공유하기"
          title="공유하기"
        >
          <Share />
        </button>
      </div>
    </header>
  );
}
