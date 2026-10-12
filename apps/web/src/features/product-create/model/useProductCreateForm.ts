'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProductService } from '@/shared/api/product/product.service';
import { PAGE } from '@/shared/config/page';
import { isHttpUrl } from '@/shared/lib/utils/url';
import { useToast } from '@/shared/ui/common/Toast';

import { ProductQueries } from '@/entities/product';

import { cleanProductUrl } from './cleanProductUrl';
import { productCreateErrorMessage } from './productCreateErrorMessage';

export default function useProductCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  // 붙여넣은 링크에서 추적 파라미터를 지웠는지. 주소가 갑자기 짧아진 이유를 알려주려고 둔다.
  const [isUrlCleaned, setIsUrlCleaned] = useState(false);
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
      toast.error('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    setIsUploadingThumbnail(true);
    try {
      const imageUrl = await ProductService.uploadProductImage(file);
      setThumbnail(imageUrl);
    } catch {
      toast.error('이미지 업로드에 실패했어요.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setIsUrlCleaned(false);
  };

  // 링크 칸은 주소 하나만 받으니, 주소를 붙여넣으면 칸 전체를 정리된 주소로 바꾼다.
  // 정리할 게 없으면 false 를 돌려 브라우저 기본 붙여넣기에 맡긴다.
  const pasteUrl = (text: string): boolean => {
    if (!isHttpUrl(text)) return false;
    const cleaned = cleanProductUrl(text);
    if (cleaned === text.trim()) return false;
    setUrl(cleaned);
    setIsUrlCleaned(true);
    return true;
  };

  // 선택 입력이라 비어 있으면 에러 아님. 값이 있는데 형식이 틀리면 에러.
  const urlError = url.trim().length > 0 && !isHttpUrl(url);

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (categoryId === null) throw new Error('CATEGORY_REQUIRED');
      return ProductService.createUserProduct({
        title: title.trim(),
        // 직접 입력·자동완성처럼 붙여넣기를 안 거친 링크도 저장 전에 정리한다.
        url: cleanProductUrl(url.trim()),
        categoryId,
        // 한화 숫자만 저장 → 상세 parsePrice 가 "30,000원" 으로 렌더.
        price: price.trim() ? price.trim() : undefined,
        thumbnail: thumbnail.trim() || undefined,
        content: content.trim() || undefined,
      });
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ProductQueries.all() });
      toast.success('핫딜이 등록되었어요.');
      router.replace(`${PAGE.DETAIL}/${productId}`);
    },
    onError: (error) => {
      toast.error(productCreateErrorMessage(error));
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
    setUrl: handleUrlChange,
    pasteUrl,
    isUrlCleaned,
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
