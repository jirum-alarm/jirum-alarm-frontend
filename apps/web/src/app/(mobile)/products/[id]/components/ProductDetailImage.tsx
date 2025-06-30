import ProductImage from '@/features/products/components/ProductImage';

export default function ProductDetailImage({
  product,
}: {
  product: {
    thumbnail?: string | null;
    title: string;
    categoryId?: number | null;
  };
}) {
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
          src={product.thumbnail ?? undefined}
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
