'use client';

import { useState } from 'react';

import {
  AdvertiseElementAsset,
  ElementConstraints,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
} from '@/hooks/graphql/advertisement';

import AssetUploader, { UploadedAssetDesignSize } from './AssetUploader';

type BreakpointKey = '_default' | `${'>=' | '<='}${number}`;

const inputClass =
  'w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-1.5 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary';

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

function getBreakpointKeys(graphic: ResponsiveAdvertiseGraphic): BreakpointKey[] {
  const keys = new Set<BreakpointKey>(['_default']);

  Object.keys(graphic.size ?? {}).forEach((key) => keys.add(key as BreakpointKey));
  graphic.foregroundElements.forEach((element) => {
    Object.keys(element.layoutByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
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
  size: Partial<GraphicSize> | undefined,
  key: keyof GraphicSize,
  value: number | undefined,
) {
  const next = { ...(size ?? {}) };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return Object.keys(next).length > 0 ? next : undefined;
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
  if (!graphic) {
    return (
      <div className="rounded-lg border border-dashed border-stroke p-6 text-sm text-bodydark2 dark:border-strokedark">
        graphic JSON이 유효하면 2Layer 편집 패널이 표시됩니다.
      </div>
    );
  }

  const breakpointKeys = getBreakpointKeys(graphic);
  const foregroundElements = graphic.foregroundElements ?? [];

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

  const removeBreakpoint = (key: BreakpointKey) => {
    if (key === '_default') return;

    updateGraphic((current) => {
      const { [key]: _, ...size } = current.size;
      return {
        ...current,
        size,
        foregroundElements: current.foregroundElements.map((element) => {
          const { [key]: __, ...layoutByWidth } = element.layoutByWidth;
          return { ...element, layoutByWidth };
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

  const copyDefaultLayoutToBreakpoint = (index: number, breakpoint: BreakpointKey) => {
    if (breakpoint === '_default') return;

    updateElement(index, (element) => ({
      ...element,
      layoutByWidth: {
        ...element.layoutByWidth,
        [breakpoint]: element.layoutByWidth._default ?? createDefaultLayout(),
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-stroke pb-4 dark:border-strokedark">
        <h3 className="text-lg font-semibold text-black dark:text-white">Graphic 2Layer</h3>
        <p className="mt-1 text-sm text-bodydark2">
          Canvas size는 BG와 elements가 함께 쓰는 좌표계입니다. 디바이스 variant를 추가하면 해당
          최소 폭에서 BG 크기와 element constraints/size를 따로 조정할 수 있습니다. default는 조건에
          걸리지 않을 때 쓰는 else/base입니다.
        </p>
      </div>

      <section className="rounded-lg border border-stroke p-4 dark:border-strokedark">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">Canvas / BG</p>
            <p className="text-xs text-bodydark2">BG와 element가 공유하는 디자인 좌표계</p>
          </div>
          <span className="rounded bg-primary px-2 py-1 text-xs text-white">Layer 1</span>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <AssetUploader
            label="배경 에셋 업로드"
            value={graphic.background.assetUrl}
            onUploaded={onBackgroundUploaded}
          />

          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="BG design W"
              value={graphic.background.designSize.width}
              onChange={(value) => updateBackgroundDesignSize('width', value)}
            />
            <NumberField
              label="BG design H"
              value={graphic.background.designSize.height}
              onChange={(value) => updateBackgroundDesignSize('height', value)}
            />
          </div>
        </div>

        <div className="mt-4 rounded border border-stroke p-3 dark:border-strokedark">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-black dark:text-white">Device Size Variants</p>
            <AddBreakpointControl onAdd={addBreakpoint} />
          </div>

          <div className="flex flex-col gap-2">
            {breakpointKeys.map((key) => {
              const size = graphic.size[key] ?? graphic.size._default;
              return (
                <div
                  key={key}
                  className="grid grid-cols-[88px_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2"
                >
                  <div className="pb-2 text-xs font-medium text-black dark:text-white">
                    {labelBreakpoint(key)}
                  </div>
                  <NumberField
                    label="canvas W"
                    value={size.width}
                    onChange={(value) => updateCanvasSize(key, 'width', value)}
                  />
                  <NumberField
                    label="canvas H"
                    value={size.height}
                    onChange={(value) => updateCanvasSize(key, 'height', value)}
                  />
                  <button
                    type="button"
                    disabled={key === '_default'}
                    className="mb-0.5 rounded bg-danger px-2 py-1.5 text-xs text-white disabled:bg-bodydark2"
                    onClick={() => removeBreakpoint(key)}
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stroke p-4 dark:border-strokedark">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">Elements</p>
            <p className="text-xs text-bodydark2">각 element의 붙는 면과 margin(px), 크기</p>
          </div>
          <span className="rounded bg-bodydark2 px-2 py-1 text-xs text-white">
            Layer 2 · {foregroundElements.length}개
          </span>
        </div>

        <AssetUploader label="전경 element 업로드" onUploaded={onForegroundUploaded} />

        {foregroundElements.length === 0 ? (
          <div className="mt-3 rounded border border-dashed border-stroke px-3 py-4 text-center text-xs text-bodydark2 dark:border-strokedark">
            전경 element가 없습니다. 업로드하면 layer stack에 추가됩니다.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {foregroundElements.map((element, index) => (
              <ElementEditor
                key={`${index}-${element.assetUrl}`}
                element={element}
                index={index}
                breakpointKeys={breakpointKeys}
                onRemove={() => onRemoveForegroundElement(index)}
                onAssetUploaded={(assetUrl, designSize) =>
                  onElementAssetUploaded(index, assetUrl, designSize)
                }
                onDesignSizeChange={(field, value) => updateElementDesignSize(index, field, value)}
                onLayoutSizeChange={(breakpoint, field, value) =>
                  updateElementLayoutSize(index, breakpoint, field, value)
                }
                onConstraintChange={(breakpoint, field, value) =>
                  updateElementConstraint(index, breakpoint, field, value)
                }
                onCopyDefault={(breakpoint) => copyDefaultLayoutToBreakpoint(index, breakpoint)}
              />
            ))}
          </div>
        )}
      </section>
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
  value: number | undefined;
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
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        min={1}
        className={inputClass}
        value={value ?? ''}
        placeholder="stretch"
        onChange={(event) => onChange(toOptionalPositiveNumber(event.target.value))}
      />
    </label>
  );
}

function AddBreakpointControl({ onAdd }: { onAdd: (width: number) => void }) {
  const [value, setValue] = useState('768');

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
        onClick={() => onAdd(toPositiveNumber(value, 768))}
      >
        variant 추가
      </button>
    </div>
  );
}

interface ElementEditorProps {
  element: AdvertiseElementAsset;
  index: number;
  breakpointKeys: BreakpointKey[];
  onRemove: () => void;
  onAssetUploaded: (assetUrl: string, designSize?: UploadedAssetDesignSize) => void;
  onDesignSizeChange: (field: keyof GraphicSize, value: number) => void;
  onLayoutSizeChange: (
    breakpoint: BreakpointKey,
    field: keyof GraphicSize,
    value: number | undefined,
  ) => void;
  onConstraintChange: (
    breakpoint: BreakpointKey,
    field: keyof ElementConstraints,
    value: number | undefined,
  ) => void;
  onCopyDefault: (breakpoint: BreakpointKey) => void;
}

function ElementEditor({
  element,
  index,
  breakpointKeys,
  onRemove,
  onAssetUploaded,
  onDesignSizeChange,
  onLayoutSizeChange,
  onConstraintChange,
  onCopyDefault,
}: ElementEditorProps) {
  return (
    <div className="rounded border border-stroke p-3 dark:border-strokedark">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-bodydark2 px-2 py-0.5 text-xs text-white">{index + 2}</span>
            <p className="text-sm font-medium text-black dark:text-white">Element {index + 1}</p>
          </div>
          <p className="mt-1 break-all text-xs text-bodydark2">{element.assetUrl}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded bg-danger px-2 py-1 text-xs text-white"
          onClick={onRemove}
        >
          삭제
        </button>
      </div>

      <div className="mb-3">
        <AssetUploader
          label={`Element ${index + 1} asset 업로드/교체`}
          value={element.assetUrl}
          onUploaded={onAssetUploaded}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <NumberField
          label="asset design W"
          value={element.designSize.width}
          onChange={(value) => onDesignSizeChange('width', value)}
        />
        <NumberField
          label="asset design H"
          value={element.designSize.height}
          onChange={(value) => onDesignSizeChange('height', value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {breakpointKeys.map((breakpoint) => {
          const layout = element.layoutByWidth[breakpoint];
          const fallbackLayout = element.layoutByWidth._default ?? createDefaultLayout();
          const activeLayout = layout ?? fallbackLayout;

          return (
            <div key={breakpoint} className="bg-gray-50 rounded p-3 dark:bg-form-input">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-black dark:text-white">
                  {labelBreakpoint(breakpoint)}
                </p>
                {!layout && breakpoint !== '_default' && (
                  <button
                    type="button"
                    className="rounded bg-primary px-2 py-1 text-xs text-white"
                    onClick={() => onCopyDefault(breakpoint)}
                  >
                    default 복사
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
                <OptionalPositiveNumberField
                  label="render W"
                  value={activeLayout.size?.width}
                  onChange={(value) => onLayoutSizeChange(breakpoint, 'width', value)}
                />
                <OptionalPositiveNumberField
                  label="render H"
                  value={activeLayout.size?.height}
                  onChange={(value) => onLayoutSizeChange(breakpoint, 'height', value)}
                />
                <OptionalNumberField
                  label="top margin"
                  value={activeLayout.constraints.top}
                  onChange={(value) => onConstraintChange(breakpoint, 'top', value)}
                />
                <OptionalNumberField
                  label="right margin"
                  value={activeLayout.constraints.right}
                  onChange={(value) => onConstraintChange(breakpoint, 'right', value)}
                />
                <OptionalNumberField
                  label="bottom margin"
                  value={activeLayout.constraints.bottom}
                  onChange={(value) => onConstraintChange(breakpoint, 'bottom', value)}
                />
                <OptionalNumberField
                  label="left margin"
                  value={activeLayout.constraints.left}
                  onChange={(value) => onConstraintChange(breakpoint, 'left', value)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
