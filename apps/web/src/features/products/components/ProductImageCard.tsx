import { EVENT } from '@/constants/mixpanel';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import React, { useState } from 'react';
import Image from 'next/image';
import { mp } from '@/lib/mixpanel';
import { IllustStanding, IllustStandingSmall } from '@/components/common/icons';
import { displayTime } from '@/util/displayTime';

export function ProductImageCard({
  product,
  collectProduct,
  type = 'product',
  logging,
}: {
  product: IProduct;
  collectProduct: (productId: number) => void;
  type?: 'product' | 'hotDeal';
  logging: { page: keyof typeof EVENT.PAGE };
}) {
  const handleClick = () => {
    collectProduct(+product.id);

    mp.track(EVENT.PRODUCT_CLICK.NAME, {
      product,
      page: EVENT.PAGE[logging.page],
    });
  };

  return (
    <a
      href={product.url}
      className={cn({
        'txs:w-[140px] xs:w-[162px]': type === 'product',
        'w-[120px]': type === 'hotDeal',
      })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <div
        className={cn({
          'relative overflow-hidden rounded-lg border border-gray-200': true,
          'txs:h-[140px] xs:h-[162px]': type === 'product',
          'h-[120px]': type === 'hotDeal',
        })}
      >
        {type === 'product' && (
          <div
            className={cn({
              'text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs':
                true,
              'border border-gray-400 bg-white px-2 text-gray-500': product.isEnd,
              'bg-error-500 px-3 text-white ': !product.isEnd && product.isHot,
            })}
          >
            {product.isEnd ? '판매종료' : product.isHot ? '핫딜' : ''}
          </div>
        )}

        <ImageWithFallback src={product?.thumbnail} title={product.title} type={type} />
      </div>
      <div className="flex flex-col">
        <span
          className={cn({
            'line-clamp-2 h-12 break-words pt-2 text-sm text-gray-700': true,
          })}
        >
          {product.title}
        </span>
        <div className="flex h-8 items-center pt-1">
          <span className="line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900">
            {product?.price ?? ''}
          </span>
          {type === 'product' && (
            <>
              {product?.price && <span className="w-2"></span>}
              <span className="text-sm text-gray-400">{displayTime(product.postedAt)}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

const ImageWithFallback = React.memo(function ImageWithFallback({
  src,
  title,
  type,
}: {
  src: string | undefined;
  title: string;
  type: 'product' | 'hotDeal';
}) {
  const [error, setError] = useState(false);

  return (
    <>
      {error || !src ? (
        <NoImage type={type} />
      ) : (
        <Image
          src={src}
          width={162}
          height={162}
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

function NoImage({ type }: { type: 'product' | 'hotDeal' }) {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      {type === 'hotDeal' ? <IllustStandingSmall /> : <IllustStanding />}
    </div>
  );
}
