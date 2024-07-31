import { EVENT } from '@/constants/mixpanel';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import { displayTime } from '@/util/displayTime';
import ImageWithFallback from '@/components/ImageWithFallback';

export function ProductLiveHotdealsImageCard({
  product,
  collectProduct,
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
      className={cn('w-full')}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <div className={'relative aspect-square overflow-hidden rounded-lg border border-gray-200'}>
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

        <ImageWithFallback
          src={product?.thumbnail ?? ''}
          alt={product.title}
          fill
          className="object-cover"
          sizes="300px"
        />
      </div>
      <div className="flex flex-col">
        <span
          className={cn({
            'line-clamp-2 h-12 break-words pt-2 text-sm text-gray-700 pc-sm:h-16 pc-sm:text-xl':
              true,
          })}
        >
          {product.title}
        </span>
        <div className="flex items-center pt-1">
          <span className="line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900 pc-sm:text-2xl">
            {product?.price ?? ''}
          </span>
          {product?.price && <span className="w-2"></span>}
          <span className="text-sm text-gray-400 pc-sm:text-base">
            {displayTime(product.postedAt)}
          </span>
        </div>
      </div>
    </a>
  );
}
