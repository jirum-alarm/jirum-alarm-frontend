import { ImageProps } from 'next/image';
import { memo } from 'react';

import { cn } from '@/lib/cn';
import { convertToWebp } from '@/util/image';

import NoImage from './NoImage';
import ImageComponent from './ProductImageComponent';

const ProductImage = memo(function ProductImage({
  src,
  alt,
  title,
  categoryId,
  type = 'product',
  className,
  ...rest
}: Omit<ImageProps, 'src'> & {
  src?: string;
  categoryId?: number | null;
  type: 'product' | 'hotDeal' | 'product-detail';
}) {
  const imageSrc = convertToWebp(src) ?? '';

  const altText = alt || title || '';
  const titleText = title || '';

  if (!imageSrc) {
    return <NoImage type={type} categoryId={categoryId} />;
  }

  return (
    <ImageComponent
      src={imageSrc}
      alt={altText}
      title={titleText}
      categoryId={categoryId}
      type={type}
      className={cn(['h-full w-full object-cover', className])}
      {...rest}
    />
  );
});

export default ProductImage;
