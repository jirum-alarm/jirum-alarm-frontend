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
  priority?: boolean;
  onImpression?: (creative: AdvertiseCreative) => void;
  onClickAd?: (creative: AdvertiseCreative) => void;
}

export default function AdvertiseBanner({
  creative,
  className,
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
    impressedCreativeIdRef.current = creative.id;
    onImpression?.(creative);
  }, [creative, inView, onImpression]);

  if (!graphic) return null;
  const measuredWidth = availableWidth || graphic.size._default.width;
  const variantSize = resolveResponsiveValue(graphic.size, measuredWidth) ?? graphic.size._default;
  const renderSize = { width: measuredWidth, height: variantSize.height };

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <Link
        ref={ref}
        href={creative.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block max-w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
        style={{ width: renderSize.width }}
        aria-label={creative.displayTitle ?? creative.internalId}
        onClick={() => onClickAd?.(creative)}
      >
        <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
          <AdvertiseGraphic graphic={graphic} containerSize={renderSize} priority={priority} />
        </motion.div>
      </Link>
    </div>
  );
}
