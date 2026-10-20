import { ProductInfoFragment } from '@/shared/api/gql/graphql';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';
import NoImage from '@/shared/ui/NoImage';

import ZoomableImage from './ProductImageViewer';

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

  // 누르면 크게 보기(검은 바탕·손가락 확대). 사진 자체는 서버 렌더 그대로 — LCP 를 늦추지 않는다.
  return (
    <ZoomableImage
      src={thumbnail}
      fallbackSrc={originalThumbnail}
      alt={title}
      className={fill ? 'absolute inset-0' : 'size-full'}
    >
      <ImageComponent
        src={thumbnail}
        fallbackSrc={originalThumbnail}
        alt={title}
        fill={fill}
        {...(!fill && { width: 512, height: 512 })}
        sizes={fill ? '(max-width: 768px) 100vw, 512px' : '512px'}
        fallback={<NoImage type="product-detail" categoryId={categoryId} />}
        priority
        fetchPriority="high"
        className="size-full object-cover"
      />
    </ZoomableImage>
  );
}
