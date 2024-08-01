'use client';

import { useToast } from '@/components/common/Toast';
import { Search, Share } from '@/components/common/icons';
import BackButton from '@/components/layout/BackButton';
import { PAGE } from '@/constants/page';
import { IProduct } from '@/graphql/interface';
import Link from 'next/link';

export default function ProductDetailPageHeader({ product }: { product: IProduct }) {
  const { toast } = useToast();

  const title = `${product.title} | 지름알림`;
  const description =
    product.guides?.map((guide) => guide.content).join(', ') || '핫딜 정보를 알려드려요!';

  const handleShare = () => {
    console.log(navigator.share);

    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url: window.location.href,
      });
    } else {
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
    <header className="fixed top-0 z-50 flex h-11 w-full max-w-[600px] flex-col items-center justify-center border border-gray-100 bg-white pr-2 text-black">
      <div className="absolute left-0">
        <BackButton backTo={PAGE.HOME} />
      </div>
      <div className="flex gap-x-4 self-end">
        <Link href={PAGE.SEARCH} prefetch={false}>
          <Search color="#101828" />
        </Link>
        <Share onClick={handleShare} className="hover:cursor-pointer" />
      </div>
    </header>
  );
}
