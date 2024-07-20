import React, { useState } from 'react';
import Image from 'next/image';
import { IllustStanding } from './common/icons';

const ImageWithFallback = React.memo(function ImageWithFallback(
  props: React.ComponentProps<typeof Image>,
) {
  const { src, alt, ...rest } = props;
  const [error, setError] = useState(false);

  return (
    <>
      {error || !src ? (
        <NoImage />
      ) : (
        <Image
          src={src}
          alt={alt}
          onError={() => setError(true)}
          placeholder="blur"
          blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
          {...rest}
        />
      )}
    </>
  );
});

export default ImageWithFallback;

function NoImage() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <IllustStanding />
    </div>
  );
}
