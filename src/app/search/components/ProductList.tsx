import { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import { EVENT } from '@/constants/mixpanel';

export default function ProductList({ products }: { products: IProduct[] }) {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
      {products.map((product, i) => (
        <ProductImageCard key={i} product={product} />
      ))}
    </div>
  );
}

function ProductImageCard({
  product,
  type = 'product',
}: {
  product: IProduct;
  type?: 'product' | 'hotDeal';
}) {
  const handleClick = () => {
    mp.track(EVENT.productClick.name, {
      product,
      page: EVENT.page.search,
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
          'relative overflow-hidden rounded-lg': true,
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
        <ImageWithFallback src={product?.thumbnail} title={product.title} />
      </div>
      <div className="flex flex-col">
        <span
          className={cn({
            'line-clamp-2 break-words pt-2 text-sm text-gray-700': true,
          })}
        >
          {product.title}
        </span>
        <span className="align-center line-clamp-1 flex h-8 pt-1 text-lg font-semibold text-gray-900">
          {product?.price ?? ''}
        </span>
      </div>
    </a>
  );
}

function ImageWithFallback({ src, title }: { src: string | undefined; title: string }) {
  const [error, setError] = useState(false);

  return error || !src ? (
    <NoImage />
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
  );
}

function NoImage() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <span className="text-center text-sm text-gray-300">
        상품 이미지
        <br />
        준비중입니다
      </span>
    </div>
  );
}