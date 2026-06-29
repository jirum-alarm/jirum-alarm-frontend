'use client';

import {
  type AdvertiseElementAsset,
  type ElementConstraints,
  type GraphicSize,
  normalizeAdvertiseAssetUrl,
  resolveResponsiveValue,
  type ResponsiveAdvertiseGraphic,
  toPercent,
} from './advertise-graphic';
import { useElementWidth } from './useElementWidth';

import type { CSSProperties } from 'react';

interface AdvertiseGraphicProps {
  graphic: ResponsiveAdvertiseGraphic;
  priority?: boolean;
}

function getElementStyle(
  element: AdvertiseElementAsset,
  containerSize: GraphicSize,
  containerWidth: number,
): CSSProperties | null {
  const layout =
    resolveResponsiveValue(element.layoutByWidth, containerWidth) ??
    element.layoutByWidth?._default;
  if (!layout) return null;

  const constraints: ElementConstraints = layout.constraints ?? {};
  const size = layout.size;
  const { width: cw, height: ch } = containerSize;
  const isWidthStretched = constraints.left !== undefined && constraints.right !== undefined;
  const isHeightStretched = constraints.top !== undefined && constraints.bottom !== undefined;

  return {
    top: constraints.top !== undefined ? toPercent(constraints.top, ch) : undefined,
    left: constraints.left !== undefined ? toPercent(constraints.left, cw) : undefined,
    bottom: constraints.bottom !== undefined ? toPercent(constraints.bottom, ch) : undefined,
    right: constraints.right !== undefined ? toPercent(constraints.right, cw) : undefined,
    width:
      size?.width !== undefined
        ? toPercent(size.width, cw)
        : isWidthStretched
          ? undefined
          : toPercent(element.designSize.width, cw),
    height:
      size?.height !== undefined
        ? toPercent(size.height, ch)
        : isHeightStretched
          ? undefined
          : toPercent(element.designSize.height, ch),
  };
}

export default function AdvertiseGraphic({ graphic, priority }: AdvertiseGraphicProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const containerWidth = width || graphic.size._default.width;
  const containerSize =
    resolveResponsiveValue(graphic.size, containerWidth) ?? graphic.size._default;

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${containerSize.width} / ${containerSize.height}` }}
    >
      {/* SVG/PNG/JPG/WebP 모두 같은 방식으로 렌더링하기 위해 next/image 대신 img를 사용한다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={normalizeAdvertiseAssetUrl(graphic.background.assetUrl)}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-fill"
      />

      {graphic.foregroundElements.map((element, index) => {
        if (!element.assetUrl) return null;
        const style = getElementStyle(element, containerSize, containerWidth);
        if (!style) return null;

        return (
          <div key={`${index}-${element.assetUrl}`} className="absolute" style={style}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeAdvertiseAssetUrl(element.assetUrl)}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-contain"
            />
          </div>
        );
      })}
    </div>
  );
}
