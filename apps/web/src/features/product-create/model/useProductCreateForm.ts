'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProductService } from '@/shared/api/product/product.service';
import { PAGE } from '@/shared/config/page';
import { useToast } from '@/shared/ui/common/Toast';

import { ProductQueries } from '@/entities/product';

export default function useProductCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (categoryId === null) throw new Error('CATEGORY_REQUIRED');
      return ProductService.createUserProduct({
        title: title.trim(),
        url: url.trim(),
        categoryId,
        price: price.trim() || undefined,
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
    title.trim().length > 0 && url.trim().length > 0 && categoryId !== null && !isSubmitting;

  return {
    title,
    setTitle,
    url,
    setUrl,
    price,
    setPrice,
    thumbnail,
    setThumbnail,
    content,
    setContent,
    categoryId,
    setCategoryId,
    submit,
    isSubmitting,
    canSubmit,
  };
}
