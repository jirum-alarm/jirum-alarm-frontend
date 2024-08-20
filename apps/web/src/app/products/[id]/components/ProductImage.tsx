'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/graphql/interface';
import { IllustStanding } from '@/components/common/icons';

export default React.memo(function ProductImage({ product }: { product: IProduct }) {
  const [error, setError] = useState(false);

  return (
    <div className="sticky top-11">
      {!error && product.thumbnail ? (
        <Image
          src={product.thumbnail}
          width={600}
          height={375}
          alt={product.title}
          onError={() => setError(true)}
          priority
          unoptimized
          style={{ maxHeight: 600, objectFit: 'contain' }}
        />
      ) : (
        <div className="flex h-[248px] w-full items-center justify-center">
          <div className="-mt-20">
            <IllustStanding />
          </div>
        </div>
      )}
    </div>
  );
});
