import { type PointerEvent } from 'react';

import { GraphicSize } from '@/hooks/graphql/advertisement';

import AssetUploader from '../AssetUploader';

import BackgroundInspector from './BackgroundInspector';
import {
  BreakpointKey,
  getVariantCanvasSize,
  resolveAssetUrl,
  resolveElementVisibility,
} from './breakpoints';
import {
  clamp,
  getElementFrame,
  getElementLayout,
  makeDraggedConstraints,
  normalizeConstraints,
} from './elementFrame';
import ElementInspector from './ElementInspector';
import { AddBreakpointControl } from './fields';
import LayerList from './LayerList';
import { PresetKey, VisualConstraintEditorProps } from './types';
import VariantCanvas from './VariantCanvas';

// 모든 variant 캔버스를 동시에 그리고, 선택·드래그·프리셋으로 constraint 를 고치는 편집기 본체.
export default function VisualConstraintEditor({
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

  const applyPreset = (preset: PresetKey) => {
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
    <section className="rounded-lg border border-stroke p-3 dark:border-strokedark sm:p-4">
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
          <div className="w-full sm:w-auto sm:min-w-64">
            <AssetUploader label="Foreground Element 추가" onUploaded={onForegroundUploaded} />
          </div>
        </div>
      </div>

      <LayerList
        graphic={graphic}
        activeBreakpoint={activeBreakpoint}
        selectedElementIndex={selectedElementIndex}
        selectedBackground={selectedBackground}
        selectedCanvasSize={selectedCanvasSize}
        onSelectedElementChange={onSelectedElementChange}
      />

      <div className="grid grid-cols-1 gap-4">
        {breakpointKeys.map((breakpoint) => (
          <VariantCanvas
            key={breakpoint}
            graphic={graphic}
            breakpoint={breakpoint}
            activeBreakpoint={activeBreakpoint}
            selectedElementIndex={selectedElementIndex}
            onActiveBreakpointChange={onActiveBreakpointChange}
            onSelectedElementChange={onSelectedElementChange}
            onDragStateChange={onDragStateChange}
            onRenameBreakpoint={onRenameBreakpoint}
            onRemoveBreakpoint={onRemoveBreakpoint}
            handleCanvasPointerMove={handleCanvasPointerMove}
            handleElementPointerDown={handleElementPointerDown}
          />
        ))}
      </div>

      <div className="mt-4 rounded border border-stroke p-3 dark:border-strokedark">
        {selectedBackground ? (
          <BackgroundInspector
            graphic={graphic}
            activeBreakpoint={activeBreakpoint}
            selectedBackgroundAssetUrl={selectedBackgroundAssetUrl}
            selectedCanvasSize={selectedCanvasSize}
            onBackgroundAssetUploadedForBreakpoint={onBackgroundAssetUploadedForBreakpoint}
            onClearBackgroundAssetOverride={onClearBackgroundAssetOverride}
            onCanvasSizeChange={onCanvasSizeChange}
            onBackgroundDesignSizeChange={onBackgroundDesignSizeChange}
          />
        ) : selectedElement && selectedLayout && selectedFrame && selectedElementIndex !== null ? (
          <ElementInspector
            selectedElement={selectedElement}
            selectedLayout={selectedLayout}
            selectedFrame={selectedFrame}
            selectedElementIndex={selectedElementIndex}
            activeBreakpoint={activeBreakpoint}
            selectedElementAssetUrl={selectedElementAssetUrl}
            selectedElementVisible={selectedElementVisible}
            applyPreset={applyPreset}
            onElementAssetUploaded={onElementAssetUploaded}
            onElementVisibilityChange={onElementVisibilityChange}
            onElementDesignSizeChange={onElementDesignSizeChange}
            onElementLayoutSizeChange={onElementLayoutSizeChange}
            onElementConstraintChange={onElementConstraintChange}
            onRemoveForegroundElement={onRemoveForegroundElement}
          />
        ) : (
          <div className="flex min-h-24 items-center justify-center text-center text-xs text-bodydark2">
            캔버스의 BG 또는 element를 선택하세요.
          </div>
        )}
      </div>
    </section>
  );
}
