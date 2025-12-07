'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

export default function ImageComponent({
  src,
  alt,
  title,
  className,
  fallback,
  fallbackSrc,
  ...rest
}: ImageProps & {
  fallback?: React.ReactNode;
  fallbackSrc?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState<any>(src);
  const [hasError, setHasError] = useState<boolean>(false);

  if (!currentSrc || hasError) {
    return fallback;
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      title={title}
      className={className}
      onError={() => {
        if (fallbackSrc && typeof currentSrc === 'string' && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        } else {
          setHasError(true);
        }
      }}
      {...rest}
    />
  );
}
