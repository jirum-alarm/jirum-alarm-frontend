'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  AdSlotLocation,
  AdSlotType,
  CreateAdInput,
  ResponsiveAdvertiseGraphic,
  useCreateAd,
  useUpdateAd,
} from '@/hooks/graphql/advertisement';

import AssetUploader from './AssetUploader';
import GraphicPreview from './GraphicPreview';

const SLOT_LOCATIONS: { value: AdSlotLocation; label: string }[] = [
  { value: 'home_carousel_banner', label: '홈 캐러셀 배너' },
  { value: 'home_main_banner', label: '홈 메인 배너' },
  { value: 'home_ranking_product', label: '홈 상품형 배너' },
  { value: 'product_main_banner', label: '프로덕트 메인 배너' },
];

const SAMPLE_GRAPHIC = `{
  "size": { "_default": { "width": 360, "height": 120 } },
  "background": {
    "designSize": { "width": 360, "height": 120 },
    "assetUrl": "https://cdn.jirum-alarm.com/ad/bg.png"
  },
  "foregroundElements": []
}`;

const inputClass =
  'w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary';

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
  const [uploadedAsset, setUploadedAsset] = useState<string>('');

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

  const handleSubmit = () => {
    if (!internalId.trim()) return alert('internalId 를 입력하세요.');
    if (slotLocation.length === 0) return alert('노출 위치를 1개 이상 선택하세요.');
    if (!startAt || !endAt) return alert('시작/종료 시각을 입력하세요.');
    if (!targetUrl.trim()) return alert('targetUrl 을 입력하세요.');
    if (parsedGraphic.error || !parsedGraphic.graphic)
      return alert(`graphic JSON 오류: ${parsedGraphic.error}`);

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
      graphic: parsedGraphic.graphic,
    };

    if (mode === 'create') createAd({ variables: { input } });
    else if (initial) updateAd({ variables: { id: Number(initial.id), input } });
  };

  const loading = creating || updating;

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
              onChange={(e) => setSlotPriority(Number(e.target.value))}
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

      {/* 우: graphic 편집 + 프리뷰 */}
      <div className="flex flex-col gap-4 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <AssetUploader
          label="에셋 업로드 (S3) → 아래 JSON 의 assetUrl 에 붙여넣기"
          value={uploadedAsset}
          onUploaded={setUploadedAsset}
        />

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

        <GraphicPreview graphic={parsedGraphic.graphic} />
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
