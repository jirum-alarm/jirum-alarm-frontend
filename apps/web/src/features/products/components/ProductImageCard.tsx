'use client';

import Image from 'next/image';
import { memo, useState } from 'react';

import { IllustEmpty } from '@/components/common/icons';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import { QueryProductsQuery } from '@/shared/api/gql/graphql';
import { displayTime } from '@/util/displayTime';

import { convertToWebp } from '../../../util/image';

import HotdealBadge from './HotdealBadge';

export function ProductImageCard({
  product,
  collectProduct,
  type = 'product',
  logging,
}: {
  product: IProduct | QueryProductsQuery['products'][number];
  collectProduct: (productId: number) => void;
  type?: 'product' | 'hotDeal';
  logging: { page: keyof typeof EVENT.PAGE };
}) {
  const handleClick = () => {
    collectProduct(+product.id);

    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_CLICK.NAME, {
    //   product,
    //   page: EVENT.PAGE[logging.page],
    // });
  };

  return (
    <Link
      href={PAGE.DETAIL + '/' + product.id}
      prefetch={false}
      className={cn({
        'txs:w-[140px] xs:w-[162px]': type === 'product',
        'w-[120px]': type === 'hotDeal',
      })}
      onClick={handleClick}
    >
      <div
        className={cn({
          'relative overflow-hidden rounded-lg border border-gray-200': true,
          'txs:h-[140px] xs:h-[162px]': type === 'product',
          'h-[120px]': type === 'hotDeal',
        })}
      >
        {type === 'product' && product.isEnd && (
          <div
            className={cn('border border-gray-400 bg-white px-2 text-gray-500', {
              'text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs':
                true,
            })}
          >
            판매종료
          </div>
        )}
        {type === 'product' && !product.isEnd && product.hotDealType && (
          <div className="absolute bottom-0 left-0 z-10">
            <HotdealBadge badgeVariant="card" hotdealType={product.hotDealType} />
          </div>
        )}

        <ImageWithFallback src={product?.thumbnail ?? ''} title={product.title} type={type} />
      </div>
      <div className="flex flex-col">
        <span
          className={cn({
            'line-clamp-2 h-12 break-words pt-2 text-sm text-gray-700': true,
          })}
        >
          {product.title}
        </span>
        <div className="flex items-center pt-1">
          <span className="line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900">
            {product?.price ?? ''}
          </span>
          {type === 'product' && (
            <>
              {product?.price && <span className="w-2"></span>}
              <span className="text-sm text-gray-600">{displayTime(product.postedAt)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

const ImageWithFallback = memo(function ImageWithFallback({
  src,
  title,
  type,
}: {
  src: string | undefined;
  title: string;
  type: 'product' | 'hotDeal';
}) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(convertToWebp(src));
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!imageSrc || imageSrc.endsWith('.webp')) {
      setImageSrc(src);
    } else {
      setError(true);
    }
  };

  return (
    <>
      {error || !src ? (
        <NoImage type={type} />
      ) : (
        <Image
          src={imageSrc ?? ''}
          width={162}
          height={162}
          alt={title}
          aria-hidden="true"
          onError={handleError}
          placeholder="blur"
          blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
          loading="lazy"
        />
      )}
    </>
  );
});

function NoImage({ type }: { type: 'product' | 'hotDeal' }) {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      {/* {type === 'hotDeal' ? <IllustStandingSmall /> : <IllustStanding />} */}
      <IllustEmpty />
    </div>
  );
}
