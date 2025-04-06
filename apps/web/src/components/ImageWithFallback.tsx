'use client';

import Image, { ImageProps } from 'next/image';
import { memo, useState } from 'react';

import { IllustEmpty } from '@/components/common/icons';
import { convertToWebp } from '@/util/image';

const ImageWithFallback = memo(function ImageWithFallback({
  src,
  alt,
  title,
  type = 'product',
  width,
  height,
  ...rest
}: Omit<ImageProps, 'src'> & {
  src?: string;
  type: 'product' | 'hotDeal';
  width?: number;
  height?: number;
}) {
  const imageSrc = src ? convertToWebp(src) : undefined;

  const [isError, setIsError] = useState<boolean>(false);

  const handleError = () => {
    setIsError(true);
  };

  if (!src || !imageSrc || isError) {
    return <NoImage type={type} />;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt || title || ''}
      title={title || ''}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      width={width}
      height={height}
      {...rest}
    />
  );
});

export default ImageWithFallback;

function NoImage({ type }: { type: 'product' | 'hotDeal' }) {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      {/* {type === 'hotDeal' ? <IllustStandingSmall /> : <IllustStanding />} */}
      <IllustEmpty />
    </div>
  );
}
