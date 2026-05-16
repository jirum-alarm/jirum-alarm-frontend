import Image, { ImageProps } from 'next/image';

import ImageWithFallback from './ImageWithFallback';

type Props = ImageProps & {
  fallback?: React.ReactNode;
  fallbackSrc?: string;
};

export default function ImageComponent({ src, fallback, fallbackSrc, ...rest }: Props) {
  if (!src) {
    return fallback ?? null;
  }

  // fallbackSrc/onError 처리가 필요 없으면 순수 SSR 경로로 next/image 직접 렌더
  // → priority 시 head에 preload link가 안정적으로 inject됨
  if (!fallbackSrc && !fallback) {
    return <Image src={src} {...rest} />;
  }

  return <ImageWithFallback src={src} fallback={fallback} fallbackSrc={fallbackSrc} {...rest} />;
}
