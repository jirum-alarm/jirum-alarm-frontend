'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  AdSlotLocation,
  AdSlotType,
  CreateAdInput,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
  useCreateAd,
  useUpdateAd,
} from '@/hooks/graphql/advertisement';

import { normalizeAssetUrl } from './assetUrl';
import GraphicLayerEditor from './GraphicLayerEditor';
import GraphicPreview from './GraphicPreview';

const SLOT_LOCATIONS: { value: AdSlotLocation; label: string }[] = [
  { value: 'home_carousel_banner', label: '홈 캐러셀 배너' },
  { value: 'home_main_banner', label: '홈 메인 배너' },
  { value: 'home_ranking_product', label: '홈 상품형 배너' },
  { value: 'product_main_banner', label: '프로덕트 메인 배너' },
];

const DEFAULT_BACKGROUND_SIZE = { width: 320, height: 92 };
const DESKTOP_BACKGROUND_SIZE = { width: 548, height: 92 };
const DEFAULT_ELEMENT_SIZE = { width: 100, height: 92 };

const DEFAULT_FOREGROUND_ELEMENTS = [
  {
    designSize: DEFAULT_ELEMENT_SIZE,
    assetUrl: '',
    layoutByWidth: {
      _default: {
        constraints: { left: 16, top: 0, bottom: 0 },
      },
      '>=768': {
        constraints: { left: 16, top: 0, bottom: 0 },
      },
    },
  },
  {
    designSize: DEFAULT_ELEMENT_SIZE,
    assetUrl: '',
    layoutByWidth: {
      _default: {
        constraints: { right: 0, top: 0, bottom: 0 },
      },
      '>=768': {
        constraints: { right: 40, top: 0, bottom: 0 },
      },
    },
  },
];

const SAMPLE_GRAPHIC = `{
  "size": {
    "_default": { "width": ${DEFAULT_BACKGROUND_SIZE.width}, "height": ${DEFAULT_BACKGROUND_SIZE.height} },
    ">=768": { "width": ${DESKTOP_BACKGROUND_SIZE.width}, "height": ${DESKTOP_BACKGROUND_SIZE.height} }
  },
  "background": {
    "designSize": { "width": ${DEFAULT_BACKGROUND_SIZE.width}, "height": ${DEFAULT_BACKGROUND_SIZE.height} },
    "assetUrl": ""
  },
  "foregroundElements": ${JSON.stringify(DEFAULT_FOREGROUND_ELEMENTS, null, 4)}
}`;

// 입력 제한 (백엔드 검증과 일치)
const LIMIT = { internalId: 255, displayTitle: 255, targetUrl: 2048 };
const CDN_BASE = 'https://cdn.jirum-alarm.com';

const inputClass =
  'w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary';

function normalizeGraphicAssetUrls(
  graphic: ResponsiveAdvertiseGraphic,
): ResponsiveAdvertiseGraphic {
  return {
    ...graphic,
    background: {
      ...graphic.background,
      assetUrl: normalizeAssetUrl(graphic.background.assetUrl),
    },
    foregroundElements: (graphic.foregroundElements ?? [])
      .filter((element) => element.assetUrl?.trim())
      .map((element) => ({
        ...element,
        assetUrl: normalizeAssetUrl(element.assetUrl),
      })),
  };
}

function upsertUploadedForegroundElement(
  elements: ResponsiveAdvertiseGraphic['foregroundElements'] | undefined,
  assetUrl: string,
  designSize: GraphicSize | undefined,
) {
  const foregroundElements = elements ?? [];
  const emptyIndex = foregroundElements.findIndex((element) => !element.assetUrl?.trim());

  if (emptyIndex >= 0) {
    return foregroundElements.map((element, index) =>
      index === emptyIndex
        ? { ...element, assetUrl, designSize: designSize ?? element.designSize }
        : element,
    );
  }

  return [
    ...foregroundElements,
    {
      designSize: designSize ?? DEFAULT_ELEMENT_SIZE,
      assetUrl,
      layoutByWidth: {
        _default: {
          constraints: { top: 0, left: 0 },
        },
      },
    },
  ];
}

const AdForm = ({ mode, initial }: { mode: 'create' | 'edit'; initial?: AdEditInitial }) => {
  const router = useRouter();

  const [internalId, setInternalId] = useState(initial?.internalId ?? '');
  const [slotType, setSlotType] = useState<AdSlotType>(initial?.slotType ?? 'banner');
  const [slotLocation, setSlotLocation] = useState<AdSlotLocation[]>(initial?.slotLocation ?? []);
  const [slotPriority, setSlotPriority] = useState(initial?.slotPriority ?? 0);
  const [startAt, setStartAt] = useState(initial?.startAt ?? '');
  const [endAt, setEndAt] = useState(initial?.endAt ?? '');
  const [targetUrl, setTargetUrl] = useState(initial?.targetUrl ?? '');
  const [displayTitle, setDisplayTitle] = useState(initial?.displayTitle ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [graphicText, setGraphicText] = useState(
    initial ? JSON.stringify(initial.graphic, null, 2) : SAMPLE_GRAPHIC,
  );

  const patchGraphicText = (
    assetUrl: string,
    patcher: (graphic: Partial<ResponsiveAdvertiseGraphic>) => Partial<ResponsiveAdvertiseGraphic>,
    fallbackMessage: (assetUrl: string) => string,
  ) => {
    try {
      const g = JSON.parse(graphicText);
      setGraphicText(JSON.stringify(patcher(g), null, 2));
    } catch {
      alert(fallbackMessage(assetUrl));
    }
  };

  // 업로드한 assetUrl을 graphic.background.assetUrl에 자동 주입(파싱 가능할 때).
  // 파싱 불가하면 textarea에 직접 넣도록 안내만.
  const handleBackgroundAssetUploaded = (assetUrl: string, designSize?: GraphicSize) => {
    patchGraphicText(
      assetUrl,
      (g) => {
        const defaultSize = g.size?._default ?? DEFAULT_BACKGROUND_SIZE;
        return {
          ...g,
          size: g.size ?? { _default: defaultSize, '>=768': DESKTOP_BACKGROUND_SIZE },
          background: {
            ...(g.background ?? {}),
            designSize: designSize ?? g.background?.designSize ?? defaultSize,
            assetUrl,
          },
          foregroundElements: g.foregroundElements ?? DEFAULT_FOREGROUND_ELEMENTS,
        };
      },
      (url) =>
        `graphic JSON이 유효하지 않아 자동 주입 실패. 아래 URL을 background.assetUrl에 직접 넣으세요:\n${url}`,
    );
  };

  const handleForegroundAssetUploaded = (assetUrl: string, designSize?: GraphicSize) => {
    patchGraphicText(
      assetUrl,
      (g) => {
        const defaultSize = g.size?._default ?? DEFAULT_BACKGROUND_SIZE;
        return {
          ...g,
          size: g.size ?? { _default: defaultSize, '>=768': DESKTOP_BACKGROUND_SIZE },
          background: g.background ?? { designSize: defaultSize, assetUrl: '' },
          foregroundElements: upsertUploadedForegroundElement(
            g.foregroundElements,
            assetUrl,
            designSize,
          ),
        };
      },
      (url) =>
        `graphic JSON이 유효하지 않아 자동 주입 실패. 아래 element를 foregroundElements에 직접 추가하세요:\n${JSON.stringify(
          {
            designSize: DEFAULT_ELEMENT_SIZE,
            assetUrl: url,
            layoutByWidth: {
              _default: {
                constraints: { top: 0, left: 0 },
              },
            },
          },
          null,
          2,
        )}`,
    );
  };

  const handleElementAssetUploaded = (
    index: number,
    assetUrl: string,
    designSize?: GraphicSize,
  ) => {
    if (!parsedGraphic.graphic) return;

    setGraphicText(
      JSON.stringify(
        {
          ...parsedGraphic.graphic,
          foregroundElements: parsedGraphic.graphic.foregroundElements.map(
            (element, elementIndex) =>
              elementIndex === index
                ? { ...element, assetUrl, designSize: designSize ?? element.designSize }
                : element,
          ),
        },
        null,
        2,
      ),
    );
  };

  // graphic JSON 파싱 (프리뷰 + 제출 공용)
  const parsedGraphic = useMemo<{
    graphic: ResponsiveAdvertiseGraphic | null;
    error: string | null;
  }>(() => {
    try {
      return { graphic: JSON.parse(graphicText) as ResponsiveAdvertiseGraphic, error: null };
    } catch (e) {
      return { graphic: null, error: e instanceof Error ? e.message : 'JSON 파싱 실패' };
    }
  }, [graphicText]);

  const [createAd, { loading: creating }] = useCreateAd({
    onCompleted: () => {
      alert('광고가 등록되었습니다.');
      router.push('/advertisement');
    },
    onError: (e) => alert(`등록 실패: ${e.message}`),
  });
  const [updateAd, { loading: updating }] = useUpdateAd({
    onCompleted: () => {
      alert('수정되었습니다.');
      router.push('/advertisement');
    },
    onError: (e) => alert(`수정 실패: ${e.message}`),
  });

  const toggleLocation = (loc: AdSlotLocation) =>
    setSlotLocation((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );

  const handleRemoveForegroundElement = (index: number) => {
    if (!parsedGraphic.graphic) return;
    setGraphicText(
      JSON.stringify(
        {
          ...parsedGraphic.graphic,
          foregroundElements: parsedGraphic.graphic.foregroundElements.filter(
            (_, i) => i !== index,
          ),
        },
        null,
        2,
      ),
    );
  };

  const handleSubmit = () => {
    if (!internalId.trim()) return alert('internalId 를 입력하세요.');
    if (internalId.length > LIMIT.internalId)
      return alert(`internalId는 ${LIMIT.internalId}자 이하여야 합니다.`);
    if (slotLocation.length === 0) return alert('노출 위치를 1개 이상 선택하세요.');
    if (!startAt || !endAt) return alert('시작/종료 시각을 입력하세요.');
    if (new Date(endAt) <= new Date(startAt))
      return alert('종료 시각이 시작 시각보다 뒤여야 합니다.');
    if (!targetUrl.trim()) return alert('targetUrl 을 입력하세요.');
    if (!/^https:\/\//.test(targetUrl)) return alert('targetUrl 은 https:// 로 시작해야 합니다.');
    if (targetUrl.length > LIMIT.targetUrl)
      return alert(`targetUrl은 ${LIMIT.targetUrl}자 이하여야 합니다.`);
    if (displayTitle.length > LIMIT.displayTitle)
      return alert(`displayTitle은 ${LIMIT.displayTitle}자 이하여야 합니다.`);
    if (parsedGraphic.error || !parsedGraphic.graphic)
      return alert(`graphic JSON 오류: ${parsedGraphic.error}`);
    // 백엔드 validateAdGraphic와 동일: 필수 키 + assetUrl CDN origin
    const g = parsedGraphic.graphic;
    if (!g.size?._default) return alert('graphic.size._default 가 필요합니다.');
    if (!g.background?.assetUrl)
      return alert('배경 에셋을 업로드하거나 background.assetUrl 을 입력하세요.');
    const urls = [
      g.background.assetUrl,
      ...(g.foregroundElements ?? []).map((e) => e?.assetUrl).filter((url) => Boolean(url)),
    ];
    const bad = urls.find((u) => !u || !u.startsWith(CDN_BASE));
    if (bad !== undefined) return alert(`모든 assetUrl은 ${CDN_BASE} 도메인이어야 합니다: ${bad}`);

    const normalizedGraphic = normalizeGraphicAssetUrls(parsedGraphic.graphic);

    const input: CreateAdInput = {
      internalId,
      slotType,
      slotLocation,
      slotPriority,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      targetUrl,
      displayTitle: displayTitle || undefined,
      isActive,
      graphic: normalizedGraphic,
    };

    if (mode === 'create') createAd({ variables: { input } });
    else if (initial) updateAd({ variables: { id: Number(initial.id), input } });
  };

  const loading = creating || updating;
  const graphic = parsedGraphic.graphic;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 좌: 폼 */}
      <div className="flex flex-col gap-4 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            internalId * (예: 얼라이브-260625-배너)
          </label>
          <input
            className={inputClass}
            value={internalId}
            maxLength={LIMIT.internalId}
            onChange={(e) => setInternalId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              슬롯 타입 *
            </label>
            <select
              className={inputClass}
              value={slotType}
              onChange={(e) => setSlotType(e.target.value as AdSlotType)}
            >
              <option value="banner">banner</option>
              <option value="pinnedProduct">pinnedProduct</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              우선순위
            </label>
            <input
              type="number"
              className={inputClass}
              value={slotPriority}
              min={0}
              max={1000}
              onChange={(e) => setSlotPriority(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            노출 위치 * (복수 선택)
          </label>
          <div className="flex flex-col gap-1">
            {SLOT_LOCATIONS.map((loc) => (
              <label
                key={loc.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-black dark:text-white"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={slotLocation.includes(loc.value)}
                  onChange={() => toggleLocation(loc.value)}
                />
                {loc.label} <span className="text-xs text-bodydark2">({loc.value})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              시작 *
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              종료 *
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            targetUrl *
          </label>
          <input
            type="url"
            className={inputClass}
            value={targetUrl}
            maxLength={LIMIT.targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            displayTitle
          </label>
          <input
            className={inputClass}
            value={displayTitle}
            maxLength={LIMIT.displayTitle}
            onChange={(e) => setDisplayTitle(e.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-black dark:text-white">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          활성화
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:bg-opacity-60"
        >
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {mode === 'create' ? '등록' : '수정'}
        </button>
      </div>

      {/* 우: graphic 2Layer 편집 + 프리뷰 */}
      <div className="flex flex-col gap-4 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <GraphicLayerEditor
          graphic={graphic}
          onGraphicChange={(nextGraphic) => setGraphicText(JSON.stringify(nextGraphic, null, 2))}
          onBackgroundUploaded={handleBackgroundAssetUploaded}
          onForegroundUploaded={handleForegroundAssetUploaded}
          onElementAssetUploaded={handleElementAssetUploaded}
          onRemoveForegroundElement={handleRemoveForegroundElement}
        />

        <GraphicPreview graphic={graphic} />

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            graphic (JSON) *
          </label>
          <textarea
            className={`${inputClass} font-mono`}
            rows={12}
            value={graphicText}
            onChange={(e) => setGraphicText(e.target.value)}
          />
          {parsedGraphic.error && (
            <p className="mt-1 text-xs text-danger">JSON 오류: {parsedGraphic.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export interface AdEditInitial {
  id: string;
  internalId: string;
  slotType: AdSlotType;
  slotLocation: AdSlotLocation[];
  slotPriority: number;
  startAt: string;
  endAt: string;
  targetUrl: string;
  displayTitle?: string | null;
  isActive: boolean;
  graphic: ResponsiveAdvertiseGraphic;
}

export default AdForm;
