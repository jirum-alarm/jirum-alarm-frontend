'use client';

import {
  type AdvertiseElementAsset,
  type ElementConstraints,
  type GraphicSize,
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
  containerSize: GraphicSize,
  containerWidth: number,
): CSSProperties | null {
  const layout =
    resolveResponsiveValue(element.layoutByWidth, containerWidth) ??
    element.layoutByWidth?._default;
  if (!layout) return null;

  const constraints: ElementConstraints = layout.constraints ?? {};
  const size = layout.size;
  const hasHorizontalConstraints =
    constraints.left !== undefined && constraints.right !== undefined;
  const hasVerticalConstraints = constraints.top !== undefined && constraints.bottom !== undefined;
  const aspectRatio =
    element.designSize.width > 0 && element.designSize.height > 0
      ? element.designSize.width / element.designSize.height
      : 1;
  const widthValue = size?.width;
  const heightValue = size?.height;
  const constrainedWidth =
    widthValue === null && hasHorizontalConstraints
      ? containerSize.width - constraints.left! - constraints.right!
      : undefined;
  const constrainedHeight =
    heightValue === null && hasVerticalConstraints
      ? containerSize.height - constraints.top! - constraints.bottom!
      : undefined;
  let frameWidth = typeof widthValue === 'number' ? widthValue : constrainedWidth;
  let frameHeight = typeof heightValue === 'number' ? heightValue : constrainedHeight;

  if (frameWidth === undefined && frameHeight === undefined) {
    frameWidth = element.designSize.width;
    frameHeight = element.designSize.height;
  } else {
    frameWidth ??= frameHeight! * aspectRatio;
    frameHeight ??= frameWidth / aspectRatio;
  }

  frameWidth = Math.max(1, frameWidth);
  frameHeight = Math.max(1, frameHeight);
  let left = 0;
  let top = 0;

  if (constraints.left !== undefined && constraints.right !== undefined) {
    left =
      constraints.left +
      (containerSize.width - constraints.left - constraints.right - frameWidth) / 2;
  } else if (constraints.left !== undefined) {
    left = constraints.left;
  } else if (constraints.right !== undefined) {
    left = containerSize.width - constraints.right - frameWidth;
  }

  if (constraints.top !== undefined && constraints.bottom !== undefined) {
    top =
      constraints.top +
      (containerSize.height - constraints.top - constraints.bottom - frameHeight) / 2;
  } else if (constraints.top !== undefined) {
    top = constraints.top;
  } else if (constraints.bottom !== undefined) {
    top = containerSize.height - constraints.bottom - frameHeight;
  }

  return {
    top,
    left,
    width: frameWidth,
    height: frameHeight,
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
        const style = getElementStyle(
          element,
          { width: containerWidth, height: containerSize.height },
          containerWidth,
        );
        if (!style) return null;

        return (
          <div key={`${index}-${element.assetUrl}`} className="absolute" style={style}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeAdvertiseAssetUrl(element.assetUrl)}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-fill"
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
