'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type Props = ImageProps & {
  fallback?: React.ReactNode;
  fallbackSrc?: string;
};

export default function ImageWithFallback({ src, fallback, fallbackSrc, ...rest }: Props) {
  const [currentSrc, setCurrentSrc] = useState<ImageProps['src']>(src);
  const [hasError, setHasError] = useState(false);

  if (!currentSrc || hasError) {
    return fallback ?? null;
  }

  return (
    <Image
      src={currentSrc}
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
