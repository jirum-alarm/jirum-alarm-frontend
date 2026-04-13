'use client';

import { useCallback } from 'react';

import { cn } from '@/shared/lib/cn';

interface AdSlotProps {
  unitId: string;
  width: number;
  height: number;
  className?: string;
}

const AdSlot = ({ unitId, width, height, className }: AdSlotProps) => {
  const iframeCallback = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe || !unitId) return;

      const write = () => {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(
          `<!DOCTYPE html><html><head><meta charset="utf-8">` +
            `<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style>` +
            `</head><body>` +
            `<ins class="kakao_ad_area" style="display:none;" ` +
            `data-ad-unit="${unitId}" data-ad-width="${width}" data-ad-height="${height}"></ins>` +
            `<script src="https://t1.daumcdn.net/kas/static/ba.min.js" async><` +
            `/script></body></html>`,
        );
        doc.close();
      };

      // iframe이 DOM에 붙었지만 contentDocument가 아직 준비 안 된 경우 대비
      if (iframe.contentDocument?.readyState === 'complete') {
        write();
      } else {
        iframe.addEventListener('load', write, { once: true });
      }
    },
    [unitId, width, height],
  );

  if (!unitId) return null;

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <iframe
        ref={iframeCallback}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        style={{ border: 'none', overflow: 'hidden' }}
        title="advertisement"
      />
    </div>
  );
};

export default AdSlot;
