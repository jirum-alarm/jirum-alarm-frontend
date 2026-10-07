import { ResponsiveAdvertiseGraphic } from '@/hooks/graphql/advertisement';

import {
  BreakpointKey,
  labelBreakpoint,
  resolveAssetUrl,
  resolveElementVisibility,
} from './breakpoints';

type Props = {
  graphic: ResponsiveAdvertiseGraphic;
  activeBreakpoint: BreakpointKey;
  selectedElementIndex: number | null;
  selectedBackground: boolean;
  selectedCanvasSize: { width: number; height: number };
  onSelectedElementChange: (index: number | null) => void;
};

// Layers 패널: Background + foreground element 목록 (현재 variant 기준 visible/hidden).
export default function LayerList({
  graphic,
  activeBreakpoint,
  selectedElementIndex,
  selectedBackground,
  selectedCanvasSize,
  onSelectedElementChange,
}: Props) {
  return (
    <div className="mb-4 rounded border border-stroke p-3 dark:border-strokedark">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-black dark:text-white">Layers</p>
        <p className="text-[11px] text-bodydark2">{labelBreakpoint(activeBreakpoint)}</p>
      </div>

      <div className="overflow-hidden rounded border border-stroke dark:border-strokedark">
        <button
          type="button"
          className={`flex h-10 w-full items-center justify-between gap-2 border-b border-stroke px-3 text-left text-xs transition last:border-b-0 dark:border-strokedark md:h-8 ${
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
              className={`flex h-10 w-full items-center justify-between gap-2 border-b border-stroke px-3 text-left text-xs transition last:border-b-0 dark:border-strokedark md:h-8 ${
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
  );
}
