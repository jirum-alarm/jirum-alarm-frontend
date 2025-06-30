import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

import NoImage from './NoImage';

export default function ImageComponent({
  src,
  alt,
  title,
  categoryId,
  type,
  className,
  ...rest
}: ImageProps & {
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
      alt={alt}
      title={title}
      className={className}
      onError={() => setIsError(true)}
      placeholder="blur"
      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      {...rest}
    />
  );
}
