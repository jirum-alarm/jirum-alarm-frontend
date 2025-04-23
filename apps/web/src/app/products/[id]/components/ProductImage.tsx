import Image from 'next/image';

import { IllustStanding } from '@/components/common/icons';
import { convertToWebp } from '@/util/image';

export default function ProductImage({
  product,
}: {
  product: { thumbnail?: string | null; title: string };
}) {
  const thumbnail = product.thumbnail ?? undefined;
  const imageSrc = convertToWebp(thumbnail);

  if (!product.thumbnail || !imageSrc) {
    return (
      <div className="flex h-[248px] w-full items-center justify-center">
        <div className="-mt-20">
          <IllustStanding />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0">
      <div
        className="relative aspect-[4/3] w-full"
        style={{
          contain: 'layout paint',
          contentVisibility: 'auto',
        }}
      >
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          priority={true}
          sizes="(max-width: 768px) 640px, 750px"
          quality={75}
          loading="eager"
          fetchPriority="high"
          placeholder="empty"
          style={{
            objectFit: 'contain',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
}
