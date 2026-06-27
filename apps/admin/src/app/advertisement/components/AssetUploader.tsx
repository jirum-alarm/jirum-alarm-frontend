'use client';

import { useState } from 'react';

import { useCreateAdAssetUploadUrl } from '@/hooks/graphql/advertisement';

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
  onUploaded: (assetUrl: string) => void;
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
      const { data } = await getUploadUrl({ variables: { contentType: file.type } });
      const presigned = data?.createAdAssetUploadUrl;
      if (!presigned) throw new Error('presigned URL 발급 실패');

      const res = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!res.ok) throw new Error(`S3 업로드 실패 (${res.status})`);

      onUploaded(presigned.assetUrl);
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
        accept="image/*"
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
