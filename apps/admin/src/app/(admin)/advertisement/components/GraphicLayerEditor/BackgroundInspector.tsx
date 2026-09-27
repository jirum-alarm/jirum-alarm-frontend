import { GraphicSize, ResponsiveAdvertiseGraphic } from '@/hooks/graphql/advertisement';

import AssetUploader from '../AssetUploader';

import { BreakpointKey, labelBreakpoint } from './breakpoints';
import { NumberField } from './fields';
import { VisualConstraintEditorProps } from './types';

type Props = Pick<
  VisualConstraintEditorProps,
  | 'onBackgroundAssetUploadedForBreakpoint'
  | 'onClearBackgroundAssetOverride'
  | 'onCanvasSizeChange'
  | 'onBackgroundDesignSizeChange'
> & {
  graphic: ResponsiveAdvertiseGraphic;
  activeBreakpoint: BreakpointKey;
  selectedBackgroundAssetUrl: string;
  selectedCanvasSize: GraphicSize;
};

// BG 선택 시 하단 편집 패널: variant 별 BG asset, canvas size, BG design size.
export default function BackgroundInspector({
  graphic,
  activeBreakpoint,
  selectedBackgroundAssetUrl,
  selectedCanvasSize,
  onBackgroundAssetUploadedForBreakpoint,
  onClearBackgroundAssetOverride,
  onCanvasSizeChange,
  onBackgroundDesignSizeChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <p className="text-sm font-semibold text-black dark:text-white">Background</p>
        <p className="mt-1 text-xs font-medium text-primary">{labelBreakpoint(activeBreakpoint)}</p>
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
        {activeBreakpoint !== '_default' && graphic.background.assetByWidth?.[activeBreakpoint] && (
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
        <p className="mb-2 text-xs font-semibold text-black dark:text-white">BG Design Size</p>
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
  );
}
