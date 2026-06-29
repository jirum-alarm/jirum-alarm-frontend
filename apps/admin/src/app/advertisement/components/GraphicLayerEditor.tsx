'use client';

import { type CSSProperties, type PointerEvent, useState } from 'react';

import {
  AdvertiseAsset,
  AdvertiseElementAsset,
  ElementConstraints,
  ElementLayoutSize,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
  ResponsiveOverrideMap,
} from '@/hooks/graphql/advertisement';

import AssetUploader, { UploadedAssetDesignSize } from './AssetUploader';
import { normalizeAssetUrl } from './assetUrl';

type BreakpointKey = '_default' | `${'>=' | '<='}${number}`;
const DEFAULT_RENDER_WIDTH_BREAKPOINT = 456;

const inputClass =
  'w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-1.5 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary';

const constraintButtonClass =
  'rounded border border-stroke px-2 py-1 text-[11px] text-black transition hover:border-primary hover:text-primary dark:border-strokedark dark:text-white';

const parseBreakpoint = (key: string) => {
  const match = /^(>=|<=)(\d+)$/.exec(key);
  return match ? { operator: match[1] as '>=' | '<=', value: Number(match[2]) } : null;
};

const sortBreakpointKeys = (keys: BreakpointKey[]) =>
  [...keys].sort((a, b) => {
    if (a === '_default') return -1;
    if (b === '_default') return 1;
    const breakpointA = parseBreakpoint(a);
    const breakpointB = parseBreakpoint(b);
    if (!breakpointA || !breakpointB) return a.localeCompare(b);
    if (breakpointA.operator !== breakpointB.operator)
      return breakpointA.operator === '>=' ? -1 : 1;
    return breakpointA.value - breakpointB.value;
  });

const labelBreakpoint = (key: BreakpointKey) => (key === '_default' ? 'default (else/base)' : key);

const createDefaultLayout = () => ({
  constraints: { top: 0, left: 0 } as ElementConstraints,
});

type ElementLayout = AdvertiseElementAsset['layoutByWidth']['_default'];

interface ElementFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragState {
  elementIndex: number;
  breakpoint: BreakpointKey;
  offsetX: number;
  offsetY: number;
}

function getBreakpointKeys(graphic: ResponsiveAdvertiseGraphic): BreakpointKey[] {
  const keys = new Set<BreakpointKey>(['_default']);

  Object.keys(graphic.size ?? {}).forEach((key) => keys.add(key as BreakpointKey));
  Object.keys(graphic.background.assetByWidth ?? {}).forEach((key) =>
    keys.add(key as BreakpointKey),
  );
  graphic.foregroundElements.forEach((element) => {
    Object.keys(element.layoutByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
    Object.keys(element.assetByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
    Object.keys(element.visibleByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
  });

  return sortBreakpointKeys([...keys]);
}

function toPositiveNumber(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function toOptionalNumber(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalPositiveNumber(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function setOptionalConstraint(
  constraints: ElementConstraints,
  key: keyof ElementConstraints,
  value: number | undefined,
) {
  const next = { ...constraints };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}

function setOptionalSize(
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveResponsiveOverride<T>(
  map: ResponsiveOverrideMap<T> | undefined,
  canvasWidth: number,
): T | undefined {
  if (!map) return undefined;

  const matched = Object.keys(map)
    .map((key) => {
      const breakpoint = parseBreakpoint(key);
      return breakpoint ? { key: key as BreakpointKey, ...breakpoint } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        key: BreakpointKey;
        operator: '>=' | '<=';
        value: number;
      } => entry !== null,
    )
    .filter((entry) =>
      entry.operator === '>=' ? canvasWidth >= entry.value : canvasWidth <= entry.value,
    )
    .sort((a, b) => {
      if (a.operator !== b.operator) return a.operator === '>=' ? -1 : 1;
      return a.operator === '>=' ? b.value - a.value : a.value - b.value;
    })[0];

  if (matched) return map[matched.key];
  return map._default;
}

function resolveAssetUrl(asset: AdvertiseAsset, canvasWidth: number) {
  return resolveResponsiveOverride(asset.assetByWidth, canvasWidth) ?? asset.assetUrl;
}

function resolveElementVisibility(element: AdvertiseElementAsset, canvasWidth: number) {
  return resolveResponsiveOverride(element.visibleByWidth, canvasWidth) ?? true;
}

function setOverride<T>(
  map: ResponsiveOverrideMap<T> | undefined,
  breakpoint: BreakpointKey,
  value: T,
) {
  return {
    ...(map ?? {}),
    [breakpoint]: value,
  };
}

function removeOverride<T>(map: ResponsiveOverrideMap<T> | undefined, breakpoint: BreakpointKey) {
  const { [breakpoint]: _, ...next } = map ?? {};
  return Object.keys(next).length > 0 ? next : undefined;
}

function renameResponsiveKey<T extends Partial<Record<BreakpointKey, unknown>>>(
  map: T | undefined,
  from: BreakpointKey,
  to: BreakpointKey,
) {
  if (!map || from === to || !(from in map)) return map;

  const { [from]: value, ...rest } = map;
  return {
    ...rest,
    [to]: value,
  } as T;
}

function getVariantCanvasSize(graphic: ResponsiveAdvertiseGraphic, breakpointKey: BreakpointKey) {
  const explicitSize = graphic.size[breakpointKey];
  if (explicitSize) return explicitSize;

  const breakpoint = parseBreakpoint(breakpointKey);
  if (!breakpoint) return graphic.size._default;

  return {
    width: breakpoint.value,
    height: graphic.size._default.height,
  };
}

function getElementAspectRatio(element: AdvertiseElementAsset) {
  if (element.designSize.width <= 0 || element.designSize.height <= 0) return 1;
  return element.designSize.width / element.designSize.height;
}

function getLayoutSizeValue(layout: ElementLayout, field: keyof GraphicSize) {
  return layout.size?.[field];
}

function getElementLayout(element: AdvertiseElementAsset, breakpoint: BreakpointKey) {
  return (
    element.layoutByWidth[breakpoint] ?? element.layoutByWidth._default ?? createDefaultLayout()
  );
}

function getElementFrame(
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

function getElementFrameStyle(
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

function makeDraggedConstraints(
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

function normalizeConstraints(constraints: ElementConstraints) {
  const next: ElementConstraints = {};
  if (constraints.top !== undefined) next.top = toFixedNumber(constraints.top);
  if (constraints.right !== undefined) next.right = toFixedNumber(constraints.right);
  if (constraints.bottom !== undefined) next.bottom = toFixedNumber(constraints.bottom);
  if (constraints.left !== undefined) next.left = toFixedNumber(constraints.left);
  return next;
}

interface GraphicLayerEditorProps {
  graphic: ResponsiveAdvertiseGraphic | null;
  onGraphicChange: (graphic: ResponsiveAdvertiseGraphic) => void;
  onBackgroundUploaded: (assetUrl: string, designSize?: UploadedAssetDesignSize) => void;
  onForegroundUploaded: (assetUrl: string, designSize?: UploadedAssetDesignSize) => void;
  onElementAssetUploaded: (
    index: number,
    assetUrl: string,
    designSize?: UploadedAssetDesignSize,
  ) => void;
  onRemoveForegroundElement: (index: number) => void;
}

export default function GraphicLayerEditor({
  graphic,
  onGraphicChange,
  onBackgroundUploaded,
  onForegroundUploaded,
  onElementAssetUploaded,
  onRemoveForegroundElement,
}: GraphicLayerEditorProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey>('_default');
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(-1);
  const [dragState, setDragState] = useState<DragState | null>(null);

  if (!graphic) {
    return (
      <div className="rounded-lg border border-dashed border-stroke p-6 text-sm text-bodydark2 dark:border-strokedark">
        graphic JSON이 유효하면 2Layer 편집 패널이 표시됩니다.
      </div>
    );
  }

  const breakpointKeys = getBreakpointKeys(graphic);
  const foregroundElements = graphic.foregroundElements ?? [];
  const selectedBreakpoint = breakpointKeys.includes(activeBreakpoint)
    ? activeBreakpoint
    : '_default';
  const selectedElement =
    selectedElementIndex !== null && selectedElementIndex >= 0
      ? foregroundElements[selectedElementIndex]
      : undefined;

  const updateGraphic = (
    updater: (graphic: ResponsiveAdvertiseGraphic) => ResponsiveAdvertiseGraphic,
  ) => {
    onGraphicChange(updater(graphic));
  };

  const updateCanvasSize = (key: BreakpointKey, field: keyof GraphicSize, value: number) => {
    updateGraphic((current) => ({
      ...current,
      size: {
        ...current.size,
        [key]: {
          ...(current.size[key] ?? current.size._default),
          [field]: value,
        },
      },
    }));
  };

  const updateBackgroundDesignSize = (field: keyof GraphicSize, value: number) => {
    updateGraphic((current) => ({
      ...current,
      background: {
        ...current.background,
        designSize: {
          ...current.background.designSize,
          [field]: value,
        },
      },
    }));
  };

  const updateBackgroundAssetForBreakpoint = (
    breakpoint: BreakpointKey,
    assetUrl: string,
    designSize?: UploadedAssetDesignSize,
  ) => {
    if (breakpoint === '_default') {
      onBackgroundUploaded(assetUrl, designSize);
      return;
    }

    updateGraphic((current) => ({
      ...current,
      background: {
        ...current.background,
        assetByWidth: setOverride(current.background.assetByWidth, breakpoint, assetUrl),
      },
    }));
  };

  const clearBackgroundAssetOverride = (breakpoint: BreakpointKey) => {
    if (breakpoint === '_default') return;

    updateGraphic((current) => ({
      ...current,
      background: {
        ...current.background,
        assetByWidth: removeOverride(current.background.assetByWidth, breakpoint),
      },
    }));
  };

  const addBreakpoint = (width: number) => {
    const key: BreakpointKey = `>=${width}`;
    if (breakpointKeys.includes(key)) return alert(`${key} variant가 이미 있습니다.`);

    updateGraphic((current) => ({
      ...current,
      size: {
        ...current.size,
        [key]: current.size._default,
      },
      foregroundElements: current.foregroundElements.map((element) => ({
        ...element,
        layoutByWidth: {
          ...element.layoutByWidth,
          [key]: element.layoutByWidth._default ?? createDefaultLayout(),
        },
      })),
    }));
  };

  const renameBreakpoint = (from: BreakpointKey, width: number) => {
    if (from === '_default') return;

    const to: BreakpointKey = `>=${width}`;
    if (from === to) return;
    if (breakpointKeys.includes(to)) return alert(`${to} variant가 이미 있습니다.`);

    updateGraphic((current) => ({
      ...current,
      size: renameResponsiveKey(current.size, from, to) ?? current.size,
      background: {
        ...current.background,
        assetByWidth: renameResponsiveKey(current.background.assetByWidth, from, to),
      },
      foregroundElements: current.foregroundElements.map((element) => ({
        ...element,
        layoutByWidth:
          renameResponsiveKey(element.layoutByWidth, from, to) ?? element.layoutByWidth,
        assetByWidth: renameResponsiveKey(element.assetByWidth, from, to),
        visibleByWidth: renameResponsiveKey(element.visibleByWidth, from, to),
      })),
    }));
    setActiveBreakpoint(to);
  };

  const removeBreakpoint = (key: BreakpointKey) => {
    if (key === '_default') return;

    updateGraphic((current) => {
      const { [key]: _, ...size } = current.size;
      return {
        ...current,
        size,
        background: {
          ...current.background,
          assetByWidth: removeOverride(current.background.assetByWidth, key),
        },
        foregroundElements: current.foregroundElements.map((element) => {
          const { [key]: __, ...layoutByWidth } = element.layoutByWidth;
          return {
            ...element,
            layoutByWidth,
            assetByWidth: removeOverride(element.assetByWidth, key),
            visibleByWidth: removeOverride(element.visibleByWidth, key),
          };
        }),
      };
    });
  };

  const updateElement = (
    index: number,
    updater: (element: AdvertiseElementAsset) => AdvertiseElementAsset,
  ) => {
    updateGraphic((current) => ({
      ...current,
      foregroundElements: current.foregroundElements.map((element, elementIndex) =>
        elementIndex === index ? updater(element) : element,
      ),
    }));
  };

  const updateElementDesignSize = (index: number, field: keyof GraphicSize, value: number) => {
    updateElement(index, (element) => ({
      ...element,
      designSize: {
        ...element.designSize,
        [field]: value,
      },
    }));
  };

  const updateElementLayoutSize = (
    index: number,
    breakpoint: BreakpointKey,
    field: keyof GraphicSize,
    value: number | undefined,
  ) => {
    updateElement(index, (element) => {
      const layout =
        element.layoutByWidth[breakpoint] ??
        element.layoutByWidth._default ??
        createDefaultLayout();
      const nextSize = setOptionalSize(layout.size, field, value);
      const nextLayout = { ...layout };

      if (nextSize) nextLayout.size = nextSize;
      else delete nextLayout.size;

      return {
        ...element,
        layoutByWidth: {
          ...element.layoutByWidth,
          [breakpoint]: nextLayout,
        },
      };
    });
  };

  const updateElementConstraint = (
    index: number,
    breakpoint: BreakpointKey,
    field: keyof ElementConstraints,
    value: number | undefined,
  ) => {
    updateElement(index, (element) => {
      const layout =
        element.layoutByWidth[breakpoint] ??
        element.layoutByWidth._default ??
        createDefaultLayout();
      return {
        ...element,
        layoutByWidth: {
          ...element.layoutByWidth,
          [breakpoint]: {
            ...layout,
            constraints: setOptionalConstraint(layout.constraints ?? {}, field, value),
          },
        },
      };
    });
  };

  const updateElementConstraints = (
    index: number,
    breakpoint: BreakpointKey,
    constraints: ElementConstraints,
  ) => {
    updateElement(index, (element) => {
      const layout =
        element.layoutByWidth[breakpoint] ??
        element.layoutByWidth._default ??
        createDefaultLayout();
      return {
        ...element,
        layoutByWidth: {
          ...element.layoutByWidth,
          [breakpoint]: {
            ...layout,
            constraints,
          },
        },
      };
    });
  };

  const updateElementLayout = (
    index: number,
    breakpoint: BreakpointKey,
    updater: (layout: ElementLayout, element: AdvertiseElementAsset) => ElementLayout,
  ) => {
    updateElement(index, (element) => {
      const layout =
        element.layoutByWidth[breakpoint] ??
        element.layoutByWidth._default ??
        createDefaultLayout();
      return {
        ...element,
        layoutByWidth: {
          ...element.layoutByWidth,
          [breakpoint]: updater(layout, element),
        },
      };
    });
  };

  const updateElementVisibility = (index: number, breakpoint: BreakpointKey, visible: boolean) => {
    updateElement(index, (element) => ({
      ...element,
      visibleByWidth: setOverride(element.visibleByWidth, breakpoint, visible),
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-stroke pb-4 dark:border-strokedark">
        <h3 className="text-lg font-semibold text-black dark:text-white">Graphic 2Layer</h3>
        <p className="mt-1 text-sm text-bodydark2">
          Canvas size는 BG와 elements가 함께 쓰는 좌표계입니다. render width variant를 추가하면 해당
          렌더 폭에서 BG 크기와 element constraints/size를 따로 조정할 수 있습니다. default는 조건에
          걸리지 않을 때 쓰는 else/base입니다.
        </p>
      </div>

      <VisualConstraintEditor
        graphic={graphic}
        breakpointKeys={breakpointKeys}
        activeBreakpoint={selectedBreakpoint}
        selectedElementIndex={
          selectedElementIndex === -1 || selectedElement ? selectedElementIndex : null
        }
        dragState={dragState}
        onActiveBreakpointChange={setActiveBreakpoint}
        onSelectedElementChange={setSelectedElementIndex}
        onDragStateChange={setDragState}
        onBackgroundAssetUploadedForBreakpoint={updateBackgroundAssetForBreakpoint}
        onClearBackgroundAssetOverride={clearBackgroundAssetOverride}
        onForegroundUploaded={onForegroundUploaded}
        onElementAssetUploaded={onElementAssetUploaded}
        onRemoveForegroundElement={onRemoveForegroundElement}
        onAddBreakpoint={addBreakpoint}
        onRenameBreakpoint={renameBreakpoint}
        onRemoveBreakpoint={removeBreakpoint}
        onCanvasSizeChange={updateCanvasSize}
        onBackgroundDesignSizeChange={updateBackgroundDesignSize}
        onElementDesignSizeChange={updateElementDesignSize}
        onElementConstraintChange={updateElementConstraint}
        onElementConstraintsChange={updateElementConstraints}
        onElementLayoutChange={updateElementLayout}
        onElementLayoutSizeChange={updateElementLayoutSize}
        onElementVisibilityChange={updateElementVisibility}
      />
    </div>
  );
}

interface VisualConstraintEditorProps {
  graphic: ResponsiveAdvertiseGraphic;
  breakpointKeys: BreakpointKey[];
  activeBreakpoint: BreakpointKey;
  selectedElementIndex: number | null;
  dragState: DragState | null;
  onActiveBreakpointChange: (breakpoint: BreakpointKey) => void;
  onSelectedElementChange: (index: number | null) => void;
  onDragStateChange: (state: DragState | null) => void;
  onBackgroundAssetUploadedForBreakpoint: (
    breakpoint: BreakpointKey,
    assetUrl: string,
    designSize?: UploadedAssetDesignSize,
  ) => void;
  onClearBackgroundAssetOverride: (breakpoint: BreakpointKey) => void;
  onForegroundUploaded: (assetUrl: string, designSize?: UploadedAssetDesignSize) => void;
  onElementAssetUploaded: (
    index: number,
    assetUrl: string,
    designSize?: UploadedAssetDesignSize,
  ) => void;
  onRemoveForegroundElement: (index: number) => void;
  onAddBreakpoint: (width: number) => void;
  onRenameBreakpoint: (breakpoint: BreakpointKey, width: number) => void;
  onRemoveBreakpoint: (breakpoint: BreakpointKey) => void;
  onCanvasSizeChange: (breakpoint: BreakpointKey, field: keyof GraphicSize, value: number) => void;
  onBackgroundDesignSizeChange: (field: keyof GraphicSize, value: number) => void;
  onElementDesignSizeChange: (index: number, field: keyof GraphicSize, value: number) => void;
  onElementConstraintChange: (
    index: number,
    breakpoint: BreakpointKey,
    field: keyof ElementConstraints,
    value: number | undefined,
  ) => void;
  onElementConstraintsChange: (
    index: number,
    breakpoint: BreakpointKey,
    constraints: ElementConstraints,
  ) => void;
  onElementLayoutChange: (
    index: number,
    breakpoint: BreakpointKey,
    updater: (layout: ElementLayout, element: AdvertiseElementAsset) => ElementLayout,
  ) => void;
  onElementLayoutSizeChange: (
    index: number,
    breakpoint: BreakpointKey,
    field: keyof GraphicSize,
    value: number | undefined,
  ) => void;
  onElementVisibilityChange: (index: number, breakpoint: BreakpointKey, visible: boolean) => void;
}

function VisualConstraintEditor({
  graphic,
  breakpointKeys,
  activeBreakpoint,
  selectedElementIndex,
  dragState,
  onActiveBreakpointChange,
  onSelectedElementChange,
  onDragStateChange,
  onBackgroundAssetUploadedForBreakpoint,
  onClearBackgroundAssetOverride,
  onForegroundUploaded,
  onElementAssetUploaded,
  onRemoveForegroundElement,
  onAddBreakpoint,
  onRenameBreakpoint,
  onRemoveBreakpoint,
  onCanvasSizeChange,
  onBackgroundDesignSizeChange,
  onElementDesignSizeChange,
  onElementConstraintChange,
  onElementConstraintsChange,
  onElementLayoutChange,
  onElementLayoutSizeChange,
  onElementVisibilityChange,
}: VisualConstraintEditorProps) {
  const selectedCanvasSize = getVariantCanvasSize(graphic, activeBreakpoint);
  const selectedElement =
    selectedElementIndex !== null && selectedElementIndex >= 0
      ? graphic.foregroundElements[selectedElementIndex]
      : undefined;
  const selectedBackground = selectedElementIndex === -1;
  const selectedLayout = selectedElement
    ? getElementLayout(selectedElement, activeBreakpoint)
    : undefined;
  const selectedFrame =
    selectedElement && selectedLayout
      ? getElementFrame(selectedElement, selectedLayout, selectedCanvasSize)
      : undefined;
  const selectedBackgroundAssetUrl = resolveAssetUrl(graphic.background, selectedCanvasSize.width);
  const selectedElementAssetUrl = selectedElement
    ? resolveAssetUrl(selectedElement, selectedCanvasSize.width)
    : '';
  const selectedElementVisible = selectedElement
    ? resolveElementVisibility(selectedElement, selectedCanvasSize.width)
    : true;

  const applyPreset = (preset: 'left' | 'right' | 'top' | 'bottom' | 'stretchX' | 'stretchY') => {
    if (selectedElementIndex === null || !selectedFrame) return;

    onElementLayoutChange(selectedElementIndex, activeBreakpoint, (layout) => {
      const nextConstraints = { ...(layout.constraints ?? {}) };
      const nextSize = { ...(layout.size ?? {}) };

      if (preset === 'left') {
        nextConstraints.left = selectedFrame.x;
        delete nextConstraints.right;
      }
      if (preset === 'right') {
        nextConstraints.right = selectedCanvasSize.width - selectedFrame.x - selectedFrame.width;
        delete nextConstraints.left;
      }
      if (preset === 'top') {
        nextConstraints.top = selectedFrame.y;
        delete nextConstraints.bottom;
      }
      if (preset === 'bottom') {
        nextConstraints.bottom = selectedCanvasSize.height - selectedFrame.y - selectedFrame.height;
        delete nextConstraints.top;
      }
      if (preset === 'stretchX') {
        nextConstraints.left = selectedFrame.x;
        nextConstraints.right = selectedCanvasSize.width - selectedFrame.x - selectedFrame.width;
        nextSize.width = null;
      }
      if (preset === 'stretchY') {
        nextConstraints.top = selectedFrame.y;
        nextConstraints.bottom = selectedCanvasSize.height - selectedFrame.y - selectedFrame.height;
        nextSize.height = null;
      }

      return {
        ...layout,
        constraints: normalizeConstraints(nextConstraints),
        size: Object.keys(nextSize).length > 0 ? nextSize : undefined,
      };
    });
  };

  const handleCanvasPointerMove = (
    event: PointerEvent<HTMLDivElement>,
    breakpoint: BreakpointKey,
    canvasSize: GraphicSize,
  ) => {
    if (!dragState || dragState.breakpoint !== breakpoint) return;
    const element = graphic.foregroundElements[dragState.elementIndex];
    if (!element) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const pointerX = (event.clientX - rect.left) * scaleX;
    const pointerY = (event.clientY - rect.top) * scaleY;
    const layout = getElementLayout(element, breakpoint);
    const frame = getElementFrame(element, layout, canvasSize);
    const nextFrame = {
      ...frame,
      x: clamp(pointerX - dragState.offsetX, 0, Math.max(0, canvasSize.width - frame.width)),
      y: clamp(pointerY - dragState.offsetY, 0, Math.max(0, canvasSize.height - frame.height)),
    };

    onElementConstraintsChange(
      dragState.elementIndex,
      breakpoint,
      makeDraggedConstraints(layout.constraints ?? {}, nextFrame, canvasSize),
    );
  };

  const handleElementPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    elementIndex: number,
    breakpoint: BreakpointKey,
    canvasSize: GraphicSize,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const canvas = event.currentTarget.parentElement;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const element = graphic.foregroundElements[elementIndex];
    const layout = getElementLayout(element, breakpoint);
    const frame = getElementFrame(element, layout, canvasSize);
    const pointerX = (event.clientX - rect.left) * scaleX;
    const pointerY = (event.clientY - rect.top) * scaleY;

    onActiveBreakpointChange(breakpoint);
    onSelectedElementChange(elementIndex);
    onDragStateChange({
      elementIndex,
      breakpoint,
      offsetX: pointerX - frame.x,
      offsetY: pointerY - frame.y,
    });
  };

  return (
    <section className="rounded-lg border border-stroke p-4 dark:border-strokedark">
      <div className="mb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              Visual Constraint Editor
            </p>
            <p className="text-xs text-bodydark2">
              모든 render width variant를 동시에 보고, element를 선택하거나 드래그해서 해당
              variant의 constraint를 편집합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded border border-stroke p-3 dark:border-strokedark">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold text-black dark:text-white">
                Render Width Variants
              </p>
              <AddBreakpointControl onAdd={onAddBreakpoint} />
            </div>
          </div>
          <div className="min-w-64">
            <AssetUploader label="Foreground Element 추가" onUploaded={onForegroundUploaded} />
          </div>
        </div>
      </div>

      <div className="mb-4 rounded border border-stroke p-3 dark:border-strokedark">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-black dark:text-white">Layers</p>
          <p className="text-[11px] text-bodydark2">{labelBreakpoint(activeBreakpoint)}</p>
        </div>

        <div className="overflow-hidden rounded border border-stroke dark:border-strokedark">
          <button
            type="button"
            className={`flex h-8 w-full items-center justify-between gap-2 border-b border-stroke px-3 text-left text-xs transition last:border-b-0 dark:border-strokedark ${
              selectedBackground
                ? 'bg-primary/10 text-primary'
                : 'bg-white text-black hover:bg-gray-2 dark:bg-boxdark dark:text-white dark:hover:bg-form-input'
            }`}
            onClick={() => onSelectedElementChange(-1)}
          >
            <span className="min-w-0 truncate font-medium">Background</span>
            <span className="shrink-0 text-[10px] font-semibold text-bodydark2">BG</span>
          </button>

          {graphic.foregroundElements.map((element, index) => {
            const elementAssetUrl = resolveAssetUrl(element, selectedCanvasSize.width);
            const elementVisible = resolveElementVisibility(element, selectedCanvasSize.width);
            const selected = index === selectedElementIndex;

            return (
              <button
                key={`${activeBreakpoint}-${index}-${elementAssetUrl}`}
                type="button"
                className={`flex h-8 w-full items-center justify-between gap-2 border-b border-stroke px-3 text-left text-xs transition last:border-b-0 dark:border-strokedark ${
                  selected
                    ? 'bg-primary/10 text-primary'
                    : 'bg-white text-black hover:bg-gray-2 dark:bg-boxdark dark:text-white dark:hover:bg-form-input'
                }`}
                onClick={() => onSelectedElementChange(index)}
              >
                <span className="min-w-0 truncate font-medium">Element {index + 1}</span>
                <span
                  className={`shrink-0 text-[10px] font-semibold ${
                    elementVisible ? 'text-success' : 'text-danger'
                  }`}
                >
                  {elementVisible ? 'visible' : 'hidden'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {breakpointKeys.map((breakpoint) => {
          const canvasSize = getVariantCanvasSize(graphic, breakpoint);
          const selectedCanvas = breakpoint === activeBreakpoint;
          const backgroundAssetUrl = resolveAssetUrl(graphic.background, canvasSize.width);

          return (
            <div
              key={breakpoint}
              className={`rounded border bg-gray-2 p-4 dark:bg-form-input ${
                selectedCanvas ? 'border-primary' : 'border-stroke dark:border-strokedark'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                {breakpoint === '_default' ? (
                  <span className="text-xs font-semibold text-black dark:text-white">
                    {labelBreakpoint(breakpoint)}
                  </span>
                ) : (
                  <BreakpointWidthField
                    breakpoint={breakpoint}
                    onCommit={(width) => onRenameBreakpoint(breakpoint, width)}
                  />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-bodydark2">
                    {canvasSize.width}×{canvasSize.height}
                  </span>
                  <button
                    type="button"
                    disabled={breakpoint === '_default'}
                    className="rounded bg-danger px-2 py-1 text-[11px] text-white disabled:bg-bodydark2"
                    onClick={() => onRemoveBreakpoint(breakpoint)}
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div
                  className="relative touch-none overflow-hidden rounded border border-stroke bg-white dark:border-strokedark"
                  style={{ width: canvasSize.width, height: canvasSize.height }}
                  onPointerMove={(event) => handleCanvasPointerMove(event, breakpoint, canvasSize)}
                  onPointerUp={() => onDragStateChange(null)}
                  onPointerLeave={() => onDragStateChange(null)}
                  onPointerDown={() => {
                    onActiveBreakpointChange(breakpoint);
                    onSelectedElementChange(-1);
                  }}
                >
                  {graphic.background.assetUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={normalizeAssetUrl(backgroundAssetUrl)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-fill"
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]" />
                  )}

                  {graphic.foregroundElements.map((element, index) => {
                    const layout = getElementLayout(element, breakpoint);
                    const selected = index === selectedElementIndex && selectedCanvas;
                    const style = getElementFrameStyle(element, layout, canvasSize);
                    const elementVisible = resolveElementVisibility(element, canvasSize.width);
                    const elementAssetUrl = resolveAssetUrl(element, canvasSize.width);
                    if (!elementVisible) return null;

                    return (
                      <div
                        key={`${index}-${breakpoint}-${elementAssetUrl}`}
                        className={`absolute cursor-move select-none border ${
                          selected
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-dashed border-primary/60 hover:border-primary'
                        }`}
                        style={style}
                        onPointerDown={(event) =>
                          handleElementPointerDown(event, index, breakpoint, canvasSize)
                        }
                      >
                        {elementAssetUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={normalizeAssetUrl(elementAssetUrl)}
                            alt=""
                            className="h-full w-full object-fill"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex h-full min-h-5 w-full min-w-8 items-center justify-center bg-primary/10 px-1 text-[10px] font-medium text-primary">
                            Element {index + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pointer-events-none absolute bottom-[8px] right-[8px] z-30 w-fit rounded-[8px] border border-white bg-[#667085]/60 px-[7px] py-[3px] text-xs font-medium leading-none text-white">
                    AD
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded border border-stroke p-3 dark:border-strokedark">
        {selectedBackground ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">Background</p>
              <p className="mt-1 text-xs font-medium text-primary">
                {labelBreakpoint(activeBreakpoint)}
              </p>
              <p className="mt-1 break-all text-[11px] text-bodydark2">
                {selectedBackgroundAssetUrl || 'asset empty'}
              </p>
              <div className="mt-3">
                <AssetUploader
                  label={
                    activeBreakpoint === '_default'
                      ? 'BG asset 업로드/교체'
                      : `${labelBreakpoint(activeBreakpoint)} BG asset 업로드/교체`
                  }
                  value={selectedBackgroundAssetUrl}
                  onUploaded={(assetUrl, designSize) =>
                    onBackgroundAssetUploadedForBreakpoint(activeBreakpoint, assetUrl, designSize)
                  }
                />
              </div>
              {activeBreakpoint !== '_default' &&
                graphic.background.assetByWidth?.[activeBreakpoint] && (
                  <button
                    type="button"
                    className="mt-2 rounded border border-stroke px-2 py-1 text-[11px] text-black hover:border-danger hover:text-danger dark:border-strokedark dark:text-white"
                    onClick={() => onClearBackgroundAssetOverride(activeBreakpoint)}
                  >
                    이 variant BG override 제거
                  </button>
                )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-black dark:text-white">Canvas Size</p>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="canvas W"
                  value={selectedCanvasSize.width}
                  onChange={(value) => onCanvasSizeChange(activeBreakpoint, 'width', value)}
                />
                <NumberField
                  label="canvas H"
                  value={selectedCanvasSize.height}
                  onChange={(value) => onCanvasSizeChange(activeBreakpoint, 'height', value)}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                BG Design Size
              </p>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="design W"
                  value={graphic.background.designSize.width}
                  onChange={(value) => onBackgroundDesignSizeChange('width', value)}
                />
                <NumberField
                  label="design H"
                  value={graphic.background.designSize.height}
                  onChange={(value) => onBackgroundDesignSizeChange('height', value)}
                />
              </div>
            </div>
          </div>
        ) : selectedElement && selectedLayout && selectedFrame && selectedElementIndex !== null ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_1.2fr_1fr_1fr]">
            <div>
              <div>
                <p className="text-sm font-semibold text-black dark:text-white">
                  Element {(selectedElementIndex ?? 0) + 1}
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {labelBreakpoint(activeBreakpoint)}
                </p>
                <p className="mt-1 break-all text-[11px] text-bodydark2">
                  {selectedElementAssetUrl || 'asset empty'}
                </p>
              </div>

              <div className="mt-3">
                <AssetUploader
                  label={`Element ${selectedElementIndex + 1} asset 업로드/교체`}
                  value={selectedElement.assetUrl}
                  onUploaded={(assetUrl, designSize) =>
                    onElementAssetUploaded(selectedElementIndex, assetUrl, designSize)
                  }
                />
              </div>

              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-black dark:text-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={selectedElementVisible}
                  onChange={(event) =>
                    onElementVisibilityChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      event.target.checked,
                    )
                  }
                />
                이 variant에서 렌더
              </label>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-bodydark2">
                <InfoCell label="x" value={selectedFrame.x} />
                <InfoCell label="y" value={selectedFrame.y} />
                <InfoCell label="w" value={selectedFrame.width} />
                <InfoCell label="h" value={selectedFrame.height} />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-black dark:text-white">Pin</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={constraintButtonClass}
                    onClick={() => applyPreset('left')}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    className={constraintButtonClass}
                    onClick={() => applyPreset('right')}
                  >
                    Right
                  </button>
                  <button
                    type="button"
                    className={constraintButtonClass}
                    onClick={() => applyPreset('top')}
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    className={constraintButtonClass}
                    onClick={() => applyPreset('bottom')}
                  >
                    Bottom
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                Design Size (wrap)
              </p>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <NumberField
                  label="design W"
                  value={selectedElement.designSize.width}
                  onChange={(value) =>
                    onElementDesignSizeChange(selectedElementIndex, 'width', value)
                  }
                />
                <NumberField
                  label="design H"
                  value={selectedElement.designSize.height}
                  onChange={(value) =>
                    onElementDesignSizeChange(selectedElementIndex, 'height', value)
                  }
                />
              </div>
              <p className="mb-2 text-xs font-semibold text-black dark:text-white">0dp Stretch</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={constraintButtonClass}
                  onClick={() => applyPreset('stretchX')}
                >
                  Stretch X
                </button>
                <button
                  type="button"
                  className={constraintButtonClass}
                  onClick={() => applyPreset('stretchY')}
                >
                  Stretch Y
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-black dark:text-white">Size Override</p>
              <div className="grid grid-cols-2 gap-2">
                <OptionalPositiveNumberField
                  label="render W"
                  value={selectedLayout.size?.width}
                  onChange={(value) =>
                    onElementLayoutSizeChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      'width',
                      value,
                    )
                  }
                />
                <OptionalPositiveNumberField
                  label="render H"
                  value={selectedLayout.size?.height}
                  onChange={(value) =>
                    onElementLayoutSizeChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      'height',
                      value,
                    )
                  }
                />
                <button
                  type="button"
                  className={constraintButtonClass}
                  onClick={() =>
                    selectedElementIndex !== null &&
                    onElementLayoutSizeChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      'width',
                      undefined,
                    )
                  }
                >
                  Clear W
                </button>
                <button
                  type="button"
                  className={constraintButtonClass}
                  onClick={() =>
                    selectedElementIndex !== null &&
                    onElementLayoutSizeChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      'height',
                      undefined,
                    )
                  }
                >
                  Clear H
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-black dark:text-white">Constraints</p>
              <div className="grid grid-cols-2 gap-2">
                <OptionalNumberField
                  label="top"
                  value={selectedLayout.constraints.top}
                  onChange={(value) =>
                    onElementConstraintChange(selectedElementIndex, activeBreakpoint, 'top', value)
                  }
                />
                <OptionalNumberField
                  label="right"
                  value={selectedLayout.constraints.right}
                  onChange={(value) =>
                    onElementConstraintChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      'right',
                      value,
                    )
                  }
                />
                <OptionalNumberField
                  label="bottom"
                  value={selectedLayout.constraints.bottom}
                  onChange={(value) =>
                    onElementConstraintChange(
                      selectedElementIndex,
                      activeBreakpoint,
                      'bottom',
                      value,
                    )
                  }
                />
                <OptionalNumberField
                  label="left"
                  value={selectedLayout.constraints.left}
                  onChange={(value) =>
                    onElementConstraintChange(selectedElementIndex, activeBreakpoint, 'left', value)
                  }
                />
              </div>
              <button
                type="button"
                className="mt-3 rounded bg-danger px-3 py-1.5 text-xs text-white"
                onClick={() => onRemoveForegroundElement(selectedElementIndex)}
              >
                Element 삭제
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-24 items-center justify-center text-center text-xs text-bodydark2">
            캔버스의 BG 또는 element를 선택하세요.
          </div>
        )}
      </div>
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-gray-2 px-2 py-1 dark:bg-form-input">
      <span className="text-bodydark2">{label}</span>
      <span className="ml-1 font-medium text-black dark:text-white">{value}</span>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        min={1}
        className={inputClass}
        value={value}
        onChange={(event) => onChange(toPositiveNumber(event.target.value, value))}
      />
    </label>
  );
}

function OptionalNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        className={inputClass}
        value={value ?? ''}
        placeholder="-"
        onChange={(event) => onChange(toOptionalNumber(event.target.value))}
      />
    </label>
  );
}

function OptionalPositiveNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        min={1}
        className={inputClass}
        value={typeof value === 'number' ? value : ''}
        placeholder={value === null ? '0dp' : 'wrap'}
        onChange={(event) => onChange(toOptionalPositiveNumber(event.target.value))}
      />
    </label>
  );
}

function BreakpointWidthField({
  breakpoint,
  onCommit,
}: {
  breakpoint: BreakpointKey;
  onCommit: (width: number) => void;
}) {
  const currentValue = parseBreakpoint(breakpoint)?.value ?? DEFAULT_RENDER_WIDTH_BREAKPOINT;
  const [value, setValue] = useState(String(currentValue));

  const commit = () => {
    const nextValue = toPositiveNumber(value, currentValue);
    setValue(String(nextValue));
    onCommit(nextValue);
  };

  return (
    <label className="flex items-center gap-1 text-xs font-semibold text-black dark:text-white">
      <span>&gt;=</span>
      <input
        type="number"
        min={1}
        className="w-20 rounded border border-stroke bg-white px-2 py-1 text-xs text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}

function AddBreakpointControl({ onAdd }: { onAdd: (width: number) => void }) {
  const [value, setValue] = useState(String(DEFAULT_RENDER_WIDTH_BREAKPOINT));

  return (
    <div className="flex items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-[11px] text-bodydark2">≥ width</span>
        <input
          type="number"
          min={1}
          className="w-24 rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-1.5 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="mb-0.5 rounded bg-primary px-3 py-1.5 text-xs text-white"
        onClick={() => onAdd(toPositiveNumber(value, DEFAULT_RENDER_WIDTH_BREAKPOINT))}
      >
        variant 추가
      </button>
    </div>
  );
}
