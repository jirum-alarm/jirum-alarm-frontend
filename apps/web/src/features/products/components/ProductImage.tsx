'use client';

import Image, { ImageProps } from 'next/image';
import { memo, useState } from 'react';

import { IllustEmpty } from '@/components/common/icons';
import { CATEGORY_MAP } from '@/constants/categories';
import { cn } from '@/lib/cn';

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
  const [isError, setIsError] = useState<boolean>(false);

  if (!src || isError) {
    return <NoImage type={type} categoryId={categoryId} />;
  }

  return (
    <Image
      src={src}
      alt={alt || title || ''}
      title={title || ''}
      onError={() => setIsError(true)}
      placeholder="blur"
      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      className={cn(['h-full w-full object-cover', className])}
      {...rest}
    />
  );
});

export default ProductImage;

function NoImage({
  type,
  categoryId,
}: {
  type: 'product' | 'hotDeal' | 'product-detail';
  categoryId?: number | null;
}) {
  const Icon = categoryId ? (CATEGORY_MAP[categoryId]?.iconComponent ?? IllustEmpty) : IllustEmpty;

  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      {/* {type === 'hotDeal' ? <IllustStandingSmall /> : <IllustStanding />} */}
      <Icon />
    </div>
  );
}
