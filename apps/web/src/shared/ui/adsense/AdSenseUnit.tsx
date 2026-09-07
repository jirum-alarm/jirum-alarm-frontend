'use client';

import Script from 'next/script';
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
  /**
   * AdSense 맞춤 채널 ID(쉼표 구분 다중 가능). AdSense 콘솔에서 만든 채널과 연결해
   * 채널별 리포트·차단을 적용한다. 선정적/민감 카테고리 차단 자체는 콘솔
   * (브랜드 안전성 → 콘텐츠 → 광고 차단 관리 → 민감한 카테고리)에서 하고,
   * 이 채널은 그 차단·분석을 위치별로 분리하는 보조 수단이다.
   */
  channel?: string;
};

export function AdSenseUnit({
  slot,
  format = 'auto',
  responsive = true,
  className,
  minHeight = 250,
  channel,
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
      {/* 스크립트는 슬롯이 실제로 그려질 때, 그리고 load 이후에 받는다. 루트 프로바이더의 afterInteractive 는
          preload 로 High 우선순위가 붙어 LCP 창에 56KB+162KB 가 들어갔고, 슬롯 없는 홈에서도 받았다.
          push({}) 는 로드 전에도 큐에 쌓이고(adsbygoogle 배열 패턴), 같은 src 는 Next 가 한 번만 로드한다. */}
      <Script
        id="adsense"
        strategy="lazyOnload"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(channel ? { 'data-ad-channel': channel } : {})}
      />
    </div>
  );
}
