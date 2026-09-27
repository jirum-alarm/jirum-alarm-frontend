'use client';

import { useState } from 'react';

import { ResponsiveAdvertiseGraphic } from '@/hooks/graphql/advertisement';

import { UploadedAssetDesignSize } from '../AssetUploader';

import { BreakpointKey, getBreakpointKeys } from './breakpoints';
import { DragState } from './elementFrame';
import { createGraphicUpdaters } from './graphicUpdaters';
import VisualConstraintEditor from './VisualConstraintEditor';

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

  const {
    updateCanvasSize,
    updateBackgroundDesignSize,
    updateBackgroundAssetForBreakpoint,
    clearBackgroundAssetOverride,
    addBreakpoint,
    renameBreakpoint,
    removeBreakpoint,
    updateElementDesignSize,
    updateElementLayoutSize,
    updateElementConstraint,
    updateElementConstraints,
    updateElementLayout,
    updateElementVisibility,
  } = createGraphicUpdaters({
    graphic,
    breakpointKeys,
    onGraphicChange,
    onBackgroundUploaded,
    setActiveBreakpoint,
  });

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
