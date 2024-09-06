'use client';

import { useToast } from '@/components/common/Toast';
import { Search, Share } from '@/components/common/icons';
import BackButton from '@/components/layout/BackButton';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import { ProductQueries } from '@/entities/product';
import { IProduct } from '@/graphql/interface';
import { mp } from '@/lib/mixpanel';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

// { product }: { product: IProduct }
export default function ProductDetailPageHeader({ productId }: { productId: number }) {
  const { toast } = useToast();
  const {
    data: { product },
  } = useSuspenseQuery(ProductQueries.product({ id: productId }));

  if (!product) notFound();

  const title = `지름알림 | ${product.title}`;

  const handleSearch = () => {
    mp.track(EVENT.PRODUCT_SEARCH.NAME, {
      type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
      page: EVENT.PAGE.DETAIL,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      mp.track(EVENT.PRODUCT_SHARE.NAME, {
        type: EVENT.PRODUCT_SHARE.TYPE.SHARE_API,
        page: EVENT.PAGE.DETAIL,
      });

      navigator.share({
        title,
        url: window.location.href,
      });
    } else {
      mp.track(EVENT.PRODUCT_SHARE.NAME, {
        type: EVENT.PRODUCT_SHARE.TYPE.NOT_SHARE_API,
        page: EVENT.PAGE.DETAIL,
      });

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
    <header className="fixed top-0 z-50 flex h-11 w-full max-w-screen-layout-max flex-col items-center justify-center border border-gray-100 bg-white text-black">
      <div className="absolute left-0">
        <BackButton backTo={PAGE.HOME} />
      </div>
      <div className="flex gap-x-2 self-end pr-4">
        <a href={PAGE.SEARCH} onClick={handleSearch}>
          <Search color="#101828" />
        </a>
        <Share onClick={handleShare} className="hover:cursor-pointer" />
      </div>
    </header>
  );
}
