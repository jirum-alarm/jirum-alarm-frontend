'use client';

import Clarity from '@microsoft/clarity';
import { env } from 'next-runtime-env';
import { useEffect } from 'react';

import { IS_PRD } from '@/shared/config/env';

interface Params {
  productId: number | string;
  isEnd?: boolean | null;
}

export function useProductPurchaseStatusClarity({ productId, isEnd }: Params) {
  const clarityProjectId = env('NEXT_PUBLIC_CLARITY_PROJECT_ID') ?? '';

  useEffect(() => {
    if (!IS_PRD || !clarityProjectId) {
      return;
    }

    Clarity.setTag('product_purchase_status', isEnd ? 'ended' : 'available');
  }, [clarityProjectId, isEnd, productId]);
}
