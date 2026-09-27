import { type CSSProperties } from 'react';

import {
  AdvertiseElementAsset,
  ElementConstraints,
  ElementLayoutSize,
  GraphicSize,
} from '@/hooks/graphql/advertisement';

import { BreakpointKey } from './breakpoints';

// (파일명을 layout 으로 두면 Next app 라우터가 레이아웃 파일로 오인한다.)
// element 의 constraints/size → 캔버스 위 프레임 계산과 드래그 결과 역산 (순수 함수).
export const createDefaultLayout = () => ({
  constraints: { top: 0, left: 0 } as ElementConstraints,
});

export type ElementLayout = AdvertiseElementAsset['layoutByWidth']['_default'];

export interface ElementFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DragState {
  elementIndex: number;
  breakpoint: BreakpointKey;
  offsetX: number;
  offsetY: number;
}

export function setOptionalConstraint(
  constraints: ElementConstraints,
  key: keyof ElementConstraints,
  value: number | undefined,
) {
  const next = { ...constraints };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}

export function setOptionalSize(
  size: ElementLayoutSize | undefined,
  key: keyof GraphicSize,
  value: number | undefined,
) {
  const next = { ...(size ?? {}) };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return Object.keys(next).length > 0 ? next : undefined;
}

function toFixedNumber(value: number) {
  return Math.round(value * 100) / 100;
}

function toDragPixel(value: number) {
  return Math.round(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getElementAspectRatio(element: AdvertiseElementAsset) {
  if (element.designSize.width <= 0 || element.designSize.height <= 0) return 1;
  return element.designSize.width / element.designSize.height;
}

function getLayoutSizeValue(layout: ElementLayout, field: keyof GraphicSize) {
  return layout.size?.[field];
}

export function getElementLayout(element: AdvertiseElementAsset, breakpoint: BreakpointKey) {
  return (
    element.layoutByWidth[breakpoint] ?? element.layoutByWidth._default ?? createDefaultLayout()
  );
}

export function getElementFrame(
  element: AdvertiseElementAsset,
  layout: ElementLayout,
  canvasSize: GraphicSize,
): ElementFrame {
  const constraints = layout.constraints ?? {};
  const hasHorizontalConstraints =
    constraints.left !== undefined && constraints.right !== undefined;
  const hasVerticalConstraints = constraints.top !== undefined && constraints.bottom !== undefined;
  const widthValue = getLayoutSizeValue(layout, 'width');
  const heightValue = getLayoutSizeValue(layout, 'height');
  const aspectRatio = getElementAspectRatio(element);
  const constrainedWidth =
    widthValue === null && hasHorizontalConstraints
      ? canvasSize.width - constraints.left! - constraints.right!
      : undefined;
  const constrainedHeight =
    heightValue === null && hasVerticalConstraints
      ? canvasSize.height - constraints.top! - constraints.bottom!
      : undefined;
  let width = typeof widthValue === 'number' ? widthValue : constrainedWidth;
  let height = typeof heightValue === 'number' ? heightValue : constrainedHeight;

  if (width === undefined && height === undefined) {
    width = element.designSize.width;
    height = element.designSize.height;
  } else {
    width ??= height! * aspectRatio;
    height ??= width / aspectRatio;
  }

  const normalizedWidth = Math.max(1, width);
  const normalizedHeight = Math.max(1, height);
  let x = 0;
  let y = 0;

  if (constraints.left !== undefined && constraints.right !== undefined) {
    x =
      constraints.left +
      (canvasSize.width - constraints.left - constraints.right - normalizedWidth) / 2;
  } else if (constraints.left !== undefined) {
    x = constraints.left;
  } else if (constraints.right !== undefined) {
    x = canvasSize.width - constraints.right - normalizedWidth;
  }

  if (constraints.top !== undefined && constraints.bottom !== undefined) {
    y =
      constraints.top +
      (canvasSize.height - constraints.top - constraints.bottom - normalizedHeight) / 2;
  } else if (constraints.top !== undefined) {
    y = constraints.top;
  } else if (constraints.bottom !== undefined) {
    y = canvasSize.height - constraints.bottom - normalizedHeight;
  }

  return {
    x: toFixedNumber(x),
    y: toFixedNumber(y),
    width: toFixedNumber(normalizedWidth),
    height: toFixedNumber(normalizedHeight),
  };
}

export function getElementFrameStyle(
  element: AdvertiseElementAsset,
  layout: ElementLayout,
  canvasSize: GraphicSize,
): CSSProperties {
  const frame = getElementFrame(element, layout, canvasSize);

  return {
    top: frame.y,
    left: frame.x,
    width: frame.width,
    height: frame.height,
  };
}

export function makeDraggedConstraints(
  constraints: ElementConstraints,
  frame: ElementFrame,
  canvasSize: GraphicSize,
): ElementConstraints {
  const next = { ...constraints };

  if (constraints.left !== undefined && constraints.right !== undefined) {
    next.left = toDragPixel(frame.x);
    next.right = toDragPixel(canvasSize.width - frame.x - frame.width);
  } else if (constraints.right !== undefined && constraints.left === undefined) {
    next.right = toDragPixel(canvasSize.width - frame.x - frame.width);
  } else {
    next.left = toDragPixel(frame.x);
    delete next.right;
  }

  if (constraints.top !== undefined && constraints.bottom !== undefined) {
    next.top = toDragPixel(frame.y);
    next.bottom = toDragPixel(canvasSize.height - frame.y - frame.height);
  } else if (constraints.bottom !== undefined && constraints.top === undefined) {
    next.bottom = toDragPixel(canvasSize.height - frame.y - frame.height);
  } else {
    next.top = toDragPixel(frame.y);
    delete next.bottom;
  }

  return next;
}

export function normalizeConstraints(constraints: ElementConstraints) {
  const next: ElementConstraints = {};
  if (constraints.top !== undefined) next.top = toFixedNumber(constraints.top);
  if (constraints.right !== undefined) next.right = toFixedNumber(constraints.right);
  if (constraints.bottom !== undefined) next.bottom = toFixedNumber(constraints.bottom);
  if (constraints.left !== undefined) next.left = toFixedNumber(constraints.left);
  return next;
}
