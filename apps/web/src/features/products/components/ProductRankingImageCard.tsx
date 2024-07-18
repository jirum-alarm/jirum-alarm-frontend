import { EVENT } from '@/constants/mixpanel';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import React, { useState } from 'react';
import Image from 'next/image';
import { mp } from '@/lib/mixpanel';
import { IllustStanding } from '@/components/common/icons';

export function ProductRankingImageCard({
  product,
  collectProduct,
  logging,
  activeIndex,
  index,
}: {
  product: Pick<IProduct, 'id' | 'title' | 'url' | 'price' | 'thumbnail'>;
  collectProduct: (productId: number) => void;
  logging: { page: keyof typeof EVENT.PAGE };
  activeIndex: number;
  index: number;
}) {
  const handleClick = () => {
    collectProduct(+product.id);

    mp.track(EVENT.PRODUCT_CLICK.NAME, {
      product,
      page: EVENT.PAGE[logging.page],
    });
  };

  return (
    <a href={product.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
      <div
        className={cn(
          `h-[340px] w-[240px] origin-center overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all`,
          {
            'scale-100': activeIndex === index,
            'scale-90': activeIndex !== index,
          },
        )}
      >
        <div className="relative h-[240px] w-full">
          <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900 text-sm text-primary-500">
            {index + 1}
          </div>
          <ImageWithFallback src={product.thumbnail ?? ''} title={product.title} />
        </div>
        <div className="p-3 pb-0">
          <div className="line-clamp-2 text-sm text-gray-700">{product.title}</div>
          <div className="pt-2 text-lg font-semibold text-gray-900">{product.price ?? ''}</div>
        </div>
      </div>
    </a>
  );
}

const ImageWithFallback = React.memo(function ImageWithFallback({
  src,
  title,
}: {
  src: string | undefined;
  title: string;
}) {
  const [error, setError] = useState(false);

  return (
    <>
      {error || !src ? (
        <NoImage />
      ) : (
        <Image
          fill
          className="object-cover"
          src={src}
          alt={title}
          onError={() => setError(true)}
          priority
          unoptimized
          placeholder="blur"
          blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
        />
      )}
    </>
  );
});

function NoImage() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <IllustStanding />
    </div>
  );
}
