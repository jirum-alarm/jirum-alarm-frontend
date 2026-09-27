import {
  AdvertiseElementAsset,
  ElementConstraints,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
} from '@/hooks/graphql/advertisement';

import { UploadedAssetDesignSize } from '../AssetUploader';

import { BreakpointKey, removeOverride, renameResponsiveKey, setOverride } from './breakpoints';
import {
  createDefaultLayout,
  ElementLayout,
  setOptionalConstraint,
  setOptionalSize,
} from './elementFrame';

type Params = {
  graphic: ResponsiveAdvertiseGraphic;
  breakpointKeys: BreakpointKey[];
  onGraphicChange: (graphic: ResponsiveAdvertiseGraphic) => void;
  onBackgroundUploaded: (assetUrl: string, designSize?: UploadedAssetDesignSize) => void;
  setActiveBreakpoint: (breakpoint: BreakpointKey) => void;
};

// graphic 을 불변 갱신하는 편집 연산들. 원본처럼 렌더마다 새로 만든다(현재 graphic 을 클로저로 잡는다).
export function createGraphicUpdaters({
  graphic,
  breakpointKeys,
  onGraphicChange,
  onBackgroundUploaded,
  setActiveBreakpoint,
}: Params) {
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

  return {
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
  };
}
