import { type PointerEvent } from 'react';

import { GraphicSize, ResponsiveAdvertiseGraphic } from '@/hooks/graphql/advertisement';

import { normalizeAssetUrl } from '../assetUrl';

import {
  BreakpointKey,
  getVariantCanvasSize,
  labelBreakpoint,
  resolveAssetUrl,
  resolveElementVisibility,
} from './breakpoints';
import { getElementFrameStyle, getElementLayout } from './elementFrame';
import { BreakpointWidthField } from './fields';

type Props = {
  graphic: ResponsiveAdvertiseGraphic;
  breakpoint: BreakpointKey;
  activeBreakpoint: BreakpointKey;
  selectedElementIndex: number | null;
  onActiveBreakpointChange: (breakpoint: BreakpointKey) => void;
  onSelectedElementChange: (index: number | null) => void;
  onDragStateChange: (state: null) => void;
  onRenameBreakpoint: (breakpoint: BreakpointKey, width: number) => void;
  onRemoveBreakpoint: (breakpoint: BreakpointKey) => void;
  handleCanvasPointerMove: (
    event: PointerEvent<HTMLDivElement>,
    breakpoint: BreakpointKey,
    canvasSize: GraphicSize,
  ) => void;
  handleElementPointerDown: (
    event: PointerEvent<HTMLDivElement>,
    elementIndex: number,
    breakpoint: BreakpointKey,
    canvasSize: GraphicSize,
  ) => void;
};

// variant 하나의 캔버스: 폭 편집·삭제 헤더 + BG + 드래그 가능한 element 프레임.
export default function VariantCanvas({
  graphic,
  breakpoint,
  activeBreakpoint,
  selectedElementIndex,
  onActiveBreakpointChange,
  onSelectedElementChange,
  onDragStateChange,
  onRenameBreakpoint,
  onRemoveBreakpoint,
  handleCanvasPointerMove,
  handleElementPointerDown,
}: Props) {
  const canvasSize = getVariantCanvasSize(graphic, breakpoint);
  const selectedCanvas = breakpoint === activeBreakpoint;
  const backgroundAssetUrl = resolveAssetUrl(graphic.background, canvasSize.width);

  return (
    <div
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
}
