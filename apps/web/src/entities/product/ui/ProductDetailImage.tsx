import { ProductInfoFragment } from '@/shared/api/gql/graphql';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';
import NoImage from '@/shared/ui/NoImage';

type Props = {
  product: Pick<ProductInfoFragment, 'thumbnail' | 'title' | 'categoryId'>;
  fill: boolean;
};

export default function ProductDetailImage({ product, fill }: Props) {
  const thumbnail = convertToWebp(product.thumbnail) ?? '';
  const originalThumbnail = product.thumbnail ?? '';
  const title = product.title ?? '';
  const categoryId = product.categoryId;

  if (!thumbnail) {
    return <NoImage type="product-detail" categoryId={categoryId} />;
  }

  return (
    <ImageComponent
      src={thumbnail}
      fallbackSrc={originalThumbnail}
      alt={title}
      fill={fill}
      {...(!fill && { width: 512, height: 512 })}
      sizes={fill ? '(max-width: 768px) 100vw, 512px' : '512px'}
      fallback={<NoImage type="product-detail" categoryId={categoryId} />}
      priority
      quality={85}
      className="size-full object-cover"
    />
  );
}
