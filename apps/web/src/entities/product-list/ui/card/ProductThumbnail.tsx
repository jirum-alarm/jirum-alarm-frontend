import { ImageProps } from 'next/image';
import { memo } from 'react';

import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';
import NoImage from '@/shared/ui/NoImage';

const ProductThumbnail = memo(function ProductThumbnail({
  src,
  alt,
  title,
  categoryId,
  type = 'product',
  className,
  loading = 'eager',
  ...rest
}: Omit<ImageProps, 'src'> & {
  src?: string;
  categoryId?: number | null;
  type: 'product' | 'hotDeal';
}) {
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
      loading={loading}
      width={192}
      height={192}
      sizes="192px"
      className={cn(['h-full w-full object-cover', className])}
      {...rest}
    />
  );
});

export default ProductThumbnail;
