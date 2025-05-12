import ProductImage from '@/features/products/components/ProductImage';
import { convertToWebp } from '@/util/image';

export default function ProductDetailImage({
  product,
}: {
  product: {
    thumbnail?: string | null;
    title: string;
    categoryId?: number | null;
  };
}) {
  const thumbnail = product.thumbnail ?? undefined;
  const imageSrc = convertToWebp(thumbnail);

  // if (!imageSrc && !product.categoryId) {
  //   return (
  //     <div className="flex h-[248px] w-full items-center justify-center">
  //       <div className="-mt-20">
  //         <IllustStanding />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="sticky top-0 -mb-6">
      <div
        className="relative aspect-square w-full"
        style={{
          contain: 'layout paint',
          contentVisibility: 'auto',
        }}
      >
        <ProductImage
          src={imageSrc}
          alt={product.title}
          fill
          categoryId={product.categoryId}
          type="product-detail"
          priority={true}
          quality={75}
          loading="eager"
          fetchPriority="high"
          placeholder="empty"
          style={{
            objectFit: 'contain',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
}
