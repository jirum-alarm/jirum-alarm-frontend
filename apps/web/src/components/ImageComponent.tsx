'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

export default function ImageComponent({
  src,
  alt,
  title,
  className,
  fallback,
  ...rest
}: ImageProps & {
  fallback?: React.ReactNode;
}) {
  const [isError, setIsError] = useState<boolean>(false);
  if (!src || isError) {
    return fallback;
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
