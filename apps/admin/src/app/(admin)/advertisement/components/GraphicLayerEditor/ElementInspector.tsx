import { AdvertiseElementAsset } from '@/hooks/graphql/advertisement';

import AssetUploader from '../AssetUploader';

import { BreakpointKey, labelBreakpoint } from './breakpoints';
import { ElementFrame, ElementLayout } from './elementFrame';
import { InfoCell, NumberField, OptionalNumberField, OptionalPositiveNumberField } from './fields';
import { PresetKey, VisualConstraintEditorProps } from './types';

const constraintButtonClass =
  'rounded border border-stroke px-2 py-2 text-[11px] text-black transition hover:border-primary hover:text-primary dark:border-strokedark dark:text-white md:py-1';

type Props = Pick<
  VisualConstraintEditorProps,
  | 'onElementAssetUploaded'
  | 'onElementVisibilityChange'
  | 'onElementDesignSizeChange'
  | 'onElementLayoutSizeChange'
  | 'onElementConstraintChange'
  | 'onRemoveForegroundElement'
> & {
  selectedElement: AdvertiseElementAsset;
  selectedLayout: ElementLayout;
  selectedFrame: ElementFrame;
  selectedElementIndex: number;
  activeBreakpoint: BreakpointKey;
  selectedElementAssetUrl: string;
  selectedElementVisible: boolean;
  applyPreset: (preset: PresetKey) => void;
};

// element 선택 시 하단 편집 패널: asset·렌더 여부·Pin/Stretch 프리셋·size override·constraints.
export default function ElementInspector({
  selectedElement,
  selectedLayout,
  selectedFrame,
  selectedElementIndex,
  activeBreakpoint,
  selectedElementAssetUrl,
  selectedElementVisible,
  applyPreset,
  onElementAssetUploaded,
  onElementVisibilityChange,
  onElementDesignSizeChange,
  onElementLayoutSizeChange,
  onElementConstraintChange,
  onRemoveForegroundElement,
}: Props) {
  return (
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
        <p className="mb-2 text-xs font-semibold text-black dark:text-white">Design Size (wrap)</p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <NumberField
            label="design W"
            value={selectedElement.designSize.width}
            onChange={(value) => onElementDesignSizeChange(selectedElementIndex, 'width', value)}
          />
          <NumberField
            label="design H"
            value={selectedElement.designSize.height}
            onChange={(value) => onElementDesignSizeChange(selectedElementIndex, 'height', value)}
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
              onElementLayoutSizeChange(selectedElementIndex, activeBreakpoint, 'width', value)
            }
          />
          <OptionalPositiveNumberField
            label="render H"
            value={selectedLayout.size?.height}
            onChange={(value) =>
              onElementLayoutSizeChange(selectedElementIndex, activeBreakpoint, 'height', value)
            }
          />
          <button
            type="button"
            className={constraintButtonClass}
            onClick={() =>
              selectedElementIndex !== null &&
              onElementLayoutSizeChange(selectedElementIndex, activeBreakpoint, 'width', undefined)
            }
          >
            Clear W
          </button>
          <button
            type="button"
            className={constraintButtonClass}
            onClick={() =>
              selectedElementIndex !== null &&
              onElementLayoutSizeChange(selectedElementIndex, activeBreakpoint, 'height', undefined)
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
              onElementConstraintChange(selectedElementIndex, activeBreakpoint, 'right', value)
            }
          />
          <OptionalNumberField
            label="bottom"
            value={selectedLayout.constraints.bottom}
            onChange={(value) =>
              onElementConstraintChange(selectedElementIndex, activeBreakpoint, 'bottom', value)
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
          className="mt-3 rounded bg-danger px-3 py-2 text-xs text-white md:py-1.5"
          onClick={() => onRemoveForegroundElement(selectedElementIndex)}
        >
          Element 삭제
        </button>
      </div>
    </div>
  );
}
