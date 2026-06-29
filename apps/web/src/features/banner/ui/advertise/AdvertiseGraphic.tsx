'use client';

import {
  type AdvertiseElementAsset,
  type ElementConstraints,
  normalizeAdvertiseAssetUrl,
  resolveResponsiveValue,
  type ResponsiveAdvertiseGraphic,
} from './advertise-graphic';
import { useElementWidth } from './useElementWidth';

import type { CSSProperties } from 'react';

interface AdvertiseGraphicProps {
  graphic: ResponsiveAdvertiseGraphic;
  priority?: boolean;
}

function getElementStyle(
  element: AdvertiseElementAsset,
  containerWidth: number,
): CSSProperties | null {
  const layout =
    resolveResponsiveValue(element.layoutByWidth, containerWidth) ??
    element.layoutByWidth?._default;
  if (!layout) return null;

  const constraints: ElementConstraints = layout.constraints ?? {};
  const size = layout.size;
  const isWidthStretched = constraints.left !== undefined && constraints.right !== undefined;
  const isHeightStretched = constraints.top !== undefined && constraints.bottom !== undefined;

  return {
    top: constraints.top,
    left: constraints.left,
    bottom: constraints.bottom,
    right: constraints.right,
    width:
      size?.width !== undefined
        ? size.width
        : isWidthStretched
          ? undefined
          : element.designSize.width,
    height:
      size?.height !== undefined
        ? size.height
        : isHeightStretched
          ? undefined
          : element.designSize.height,
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
      style={{ height: containerSize.height }}
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
        const style = getElementStyle(element, containerWidth);
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

      <div className="bg-opacity-90 pointer-events-none absolute right-[8px] bottom-[8px] z-30 w-fit rounded-[8px] border border-white bg-[#98A2B3] px-[7px] py-[3px] text-xs leading-none font-medium text-white">
        AD
      </div>
    </div>
  );
}
