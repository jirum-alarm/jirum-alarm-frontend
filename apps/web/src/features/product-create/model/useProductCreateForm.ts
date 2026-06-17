'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProductService } from '@/shared/api/product/product.service';
import { PAGE } from '@/shared/config/page';
import { isHttpUrl } from '@/shared/lib/utils/url';
import { useToast } from '@/shared/ui/common/Toast';

import { ProductQueries } from '@/entities/product';

export default function useProductCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  // 업로드 완료된 썸네일 CDN URL (이미지 업로드 결과).
  const [thumbnail, setThumbnail] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // 가격은 한화(KRW) 숫자만. 입력 단계에서 숫자 외 문자를 제거하고, 표시용 천 단위 콤마는 떼어 보관.
  const handlePriceChange = (raw: string) => {
    const digitsOnly = raw.replace(/[^\d]/g, '');
    setPrice(digitsOnly);
  };

  // 이미지 파일을 S3 에 업로드하고 thumbnail 을 업로드된 CDN URL 로 세팅.
  const uploadThumbnail = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    setIsUploadingThumbnail(true);
    try {
      const imageUrl = await ProductService.uploadProductImage(file);
      setThumbnail(imageUrl);
    } catch {
      toast('이미지 업로드에 실패했어요.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // 선택 입력이라 비어 있으면 에러 아님. 값이 있는데 형식이 틀리면 에러.
  const urlError = url.trim().length > 0 && !isHttpUrl(url);

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (categoryId === null) throw new Error('CATEGORY_REQUIRED');
      return ProductService.createUserProduct({
        title: title.trim(),
        url: url.trim(),
        categoryId,
        // 한화 숫자만 저장 → 상세 parsePrice 가 "30,000원" 으로 렌더.
        price: price.trim() ? price.trim() : undefined,
        thumbnail: thumbnail.trim() || undefined,
        content: content.trim() || undefined,
      });
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ProductQueries.all() });
      toast('핫딜이 등록되었어요.');
      router.replace(`${PAGE.DETAIL}/${productId}`);
    },
    onError: () => {
      toast('핫딜 등록에 실패했어요.');
    },
  });

  const canSubmit =
    title.trim().length > 0 &&
    isHttpUrl(url) &&
    categoryId !== null &&
    !isUploadingThumbnail &&
    !isSubmitting;

  return {
    title,
    setTitle,
    url,
    setUrl,
    urlError,
    price,
    setPrice: handlePriceChange,
    thumbnail,
    setThumbnail,
    uploadThumbnail,
    isUploadingThumbnail,
    content,
    setContent,
    categoryId,
    setCategoryId,
    submit,
    isSubmitting,
    canSubmit,
  };
}
