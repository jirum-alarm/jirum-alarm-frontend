'use client';

import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

import {
  type AdvertiseCreative,
  parseAdvertiseGraphic,
  resolveResponsiveValue,
} from './advertise-graphic';
import AdvertiseGraphic from './AdvertiseGraphic';
import { useElementWidth } from './useElementWidth';

interface AdvertiseBannerProps {
  creative: AdvertiseCreative;
  className?: string;
  surfaceClassName?: string;
  priority?: boolean;
  onImpression?: (creative: AdvertiseCreative) => boolean | void;
  onClickAd?: (creative: AdvertiseCreative) => void;
}

export default function AdvertiseBanner({
  creative,
  className,
  surfaceClassName,
  priority,
  onImpression,
  onClickAd,
}: AdvertiseBannerProps) {
  const graphic = parseAdvertiseGraphic(creative.graphic);
  const { ref: containerRef, width: availableWidth } = useElementWidth<HTMLDivElement>();
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const impressedCreativeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!inView) return;
    if (impressedCreativeIdRef.current === creative.id) return;
    const didHandleImpression = onImpression?.(creative);
    if (didHandleImpression === false) return;
    impressedCreativeIdRef.current = creative.id;
  }, [creative, inView, onImpression]);

  if (!graphic) return null;
  const hasMeasuredWidth = availableWidth > 0;
  const renderWidth = hasMeasuredWidth ? availableWidth : graphic.size._default.width;
  const variantSize = resolveResponsiveValue(graphic.size, renderWidth) ?? graphic.size._default;
  const renderSize = { width: renderWidth, height: variantSize.height };
  const widthStyle = hasMeasuredWidth ? renderSize.width : '100%';

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <Link
        ref={ref}
        href={creative.targetUrl}
        className={cn(
          'relative block max-w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100',
          surfaceClassName,
        )}
        style={{ width: widthStyle }}
        aria-label={creative.displayTitle ?? creative.internalId}
        data-google-vignette="false"
        onClick={() => onClickAd?.(creative)}
      >
        <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
          <AdvertiseGraphic
            graphic={graphic}
            containerSize={renderSize}
            widthStyle={widthStyle}
            isLayoutReady={hasMeasuredWidth}
            priority={priority}
          />
        </motion.div>
      </Link>
    </div>
  );
}
