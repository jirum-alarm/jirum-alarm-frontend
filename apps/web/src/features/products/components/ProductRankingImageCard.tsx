import { EVENT } from '@/constants/mixpanel';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import ImageWithFallback from '@/components/ImageWithFallback';
import { PAGE } from '@/constants/page';
import Link from 'next/link';

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
    <Link href={PAGE.DETAIL + '/' + product.id} onClick={handleClick} prefetch={false}>
      <div
        className={cn(
          `h-[340px] w-full origin-center overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all`,
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
          <ImageWithFallback
            src={product.thumbnail ?? ''}
            alt={product.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        <div className="p-3 pb-0">
          <div className="line-clamp-2 text-sm text-gray-700">{product.title}</div>
          <div className="pt-2 text-lg font-semibold text-gray-900">{product.price ?? ''}</div>
        </div>
      </div>
    </Link>
  );
}
