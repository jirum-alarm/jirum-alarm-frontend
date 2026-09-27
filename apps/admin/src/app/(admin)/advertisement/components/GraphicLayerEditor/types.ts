import {
  AdvertiseElementAsset,
  ElementConstraints,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
} from '@/hooks/graphql/advertisement';

import { UploadedAssetDesignSize } from '../AssetUploader';

import { BreakpointKey } from './breakpoints';
import { DragState, ElementLayout } from './elementFrame';

export interface VisualConstraintEditorProps {
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

export type PresetKey = 'left' | 'right' | 'top' | 'bottom' | 'stretchX' | 'stretchY';
