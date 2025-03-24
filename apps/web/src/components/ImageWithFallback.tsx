'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import { IllustEmpty } from './common/icons';
import { convertToWebp } from '../util/image';

const ImageWithFallback = React.memo(function ImageWithFallback({
  src,
  alt,
  ...rest
}: React.ComponentProps<typeof Image>) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(convertToWebp(src.toString()));
  const [isError, setIsError] = useState<boolean>(false);

  const handleError = () => {
    if (!imageSrc || imageSrc.endsWith('.webp')) {
      setImageSrc(src.toString());
    } else {
      setIsError(true);
    }
  };

  if (!src || !imageSrc || isError) {
    return <NoImage />;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      {...rest}
    />
  );
});

export default ImageWithFallback;

function NoImage() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <IllustEmpty />
    </div>
  );
}
