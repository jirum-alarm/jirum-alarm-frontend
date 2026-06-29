'use client';

import { useState } from 'react';

import { useCreateAdAssetUploadUrl } from '@/hooks/graphql/advertisement';

import { normalizeAssetUrl } from './assetUrl';

export interface UploadedAssetDesignSize {
  width: number;
  height: number;
}

const DESIGN_SCALE = 4;

function getUploadContentType(file: File) {
  if (file.type) return file.type;

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'svg') return 'image/svg+xml';
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

function parseSvgLength(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function getSvgSize(file: File) {
  const text = await file.text();
  const svg = new DOMParser().parseFromString(text, 'image/svg+xml').querySelector('svg');
  if (!svg) return null;

  const width = parseSvgLength(svg.getAttribute('width'));
  const height = parseSvgLength(svg.getAttribute('height'));
  if (width && height) return { width, height };

  const viewBox = svg
    .getAttribute('viewBox')
    ?.split(/[\s,]+/)
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  return null;
}

async function getRasterSize(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) return null;
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function getUploadedAssetDesignSize(
  file: File,
): Promise<UploadedAssetDesignSize | undefined> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const intrinsicSize = isSvg
    ? ((await getSvgSize(file)) ?? (await getRasterSize(file)))
    : await getRasterSize(file);
  if (!intrinsicSize) return undefined;

  return {
    width: Math.round((intrinsicSize.width / DESIGN_SCALE) * 100) / 100,
    height: Math.round((intrinsicSize.height / DESIGN_SCALE) * 100) / 100,
  };
}

/**
 * presigned URL 받아 S3 에 직접 PUT 후 최종 assetUrl 을 onUploaded 로 콜백.
 * 백엔드 createAdAssetUploadUrl → S3 PUT 패턴 (product 의 createProductImageUploadUrl 과 동일 흐름).
 */
const AssetUploader = ({
  label,
  value,
  onUploaded,
}: {
  label: string;
  value?: string;
  onUploaded: (assetUrl: string, designSize?: UploadedAssetDesignSize) => void;
}) => {
  const [getUploadUrl] = useCreateAdAssetUploadUrl();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const designSize = await getUploadedAssetDesignSize(file);
      const contentType = getUploadContentType(file);
      const { data } = await getUploadUrl({ variables: { contentType } });
      const presigned = data?.createAdAssetUploadUrl;
      if (!presigned) throw new Error('presigned URL 발급 실패');

      const res = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType },
      });
      if (!res.ok) throw new Error(`S3 업로드 실패 (${res.status})`);

      onUploaded(normalizeAssetUrl(presigned.assetUrl), designSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 오류');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-black dark:text-white">{label}</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFile}
        disabled={uploading}
        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-white focus:border-primary dark:border-form-strokedark dark:text-white"
      />
      {uploading && <p className="mt-1 text-xs text-bodydark2">업로드 중…</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {value && <p className="mt-1 break-all text-xs text-success">업로드됨: {value}</p>}
    </div>
  );
};

export default AssetUploader;
