'use client';

import { env } from 'next-runtime-env';
import { useEffect, useRef } from 'react';

import { IS_PRD } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';

type AdSenseUnitProps = {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  minHeight?: number;
};

export function AdSenseUnit({
  slot,
  format = 'auto',
  responsive = true,
  className,
  minHeight = 250,
}: AdSenseUnitProps) {
  const clientId = env('NEXT_PUBLIC_ADSENSE_CLIENT_ID') ?? '';
  const isPushed = useRef(false);

  useEffect(() => {
    // 이 인스턴스에서 한 번만 push. 다른 상품으로 이동하면 상위에서 key로 remount되어
    // 새 인스턴스가 다시 push한다. (AdSense는 채워진 <ins>에 재push하면 에러)
    if (!IS_PRD || !clientId || !slot || isPushed.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isPushed.current = true;
    } catch {
      // AdSense 렌더 실패는 사용자 흐름을 막지 않는다.
    }
  }, [clientId, slot]);

  if (!IS_PRD || !clientId || !slot) {
    return null;
  }

  return (
    <div className={cn('overflow-hidden', className)} style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
