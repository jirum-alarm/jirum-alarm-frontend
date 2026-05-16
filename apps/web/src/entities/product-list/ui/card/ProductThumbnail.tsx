import { memo } from 'react';

import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';
import NoImage from '@/shared/ui/NoImage';

type Props = {
  src?: string;
  alt: string;
  title?: string;
  categoryId?: number | null;
  type: 'product' | 'hotDeal';
  /** 부모 컨테이너 크기 기준의 sizes (필수: 잘못 잡으면 over-fetch) */
  sizes: string;
  className?: string;
  /** LCP 후보면 true. 자동으로 fetchPriority=high + preload */
  priority?: boolean;
  /** 명시 안 하면 'lazy'. priority가 true면 next/image가 자동으로 eager로 승격 */
  loading?: 'lazy' | 'eager';
  /** 핫딜/메인 같은 중요 이미지는 85, 일반은 75 (기본) */
  quality?: number;
};

/**
 * 상품 썸네일 표준 컴포넌트.
 * 부모는 반드시 position:relative와 명시적 크기(또는 aspect-ratio)를 가져야 한다.
 * next/image의 fill 모드로 동작하므로 width/height는 받지 않는다.
 */
const ProductThumbnail = memo(function ProductThumbnail({
  src,
  alt,
  title,
  categoryId,
  type = 'product',
  sizes,
  className,
  priority,
  loading,
  quality,
}: Props) {
  const imageSrc = convertToWebp(src) ?? '';
  const originalSrc = src ?? '';
  const altText = alt || title || '';
  const titleText = title || '';

  if (!imageSrc) {
    return <NoImage type={type} categoryId={categoryId} />;
  }

  return (
    <ImageComponent
      src={imageSrc}
      fallbackSrc={originalSrc}
      alt={altText}
      title={titleText}
      fallback={<NoImage type={type} categoryId={categoryId} />}
      fill
      sizes={sizes}
      priority={priority}
      loading={loading}
      quality={quality}
      className={cn('object-cover', className)}
    />
  );
});

export default ProductThumbnail;
