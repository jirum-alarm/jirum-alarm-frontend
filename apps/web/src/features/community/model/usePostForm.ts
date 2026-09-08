'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CommunityService } from '@/shared/api/community/community.service';
import { ProductService } from '@/shared/api/product/product.service';
import { PAGE } from '@/shared/config/page';
import { isInApp } from '@/shared/lib/webview/native';
import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';
import { useToast } from '@/shared/ui/common/Toast';

import { CommunityQueries } from '@/entities/community';

import {
  ACCEPTED_POST_IMAGE_TYPES,
  MAX_POST_IMAGE_BYTES,
  MAX_POST_IMAGES,
  parsePostContent,
  serializePostContent,
} from '../lib/postContent';

export type TaggedProduct = {
  id: number;
  title: string;
  thumbnail?: string | null;
  price?: string | null;
};

export default function usePostForm(
  editPostId?: number,
  initialContent?: string,
  initialTitle?: string,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const initial = parsePostContent(initialContent ?? '');

  const [title, setTitle] = useState(initialTitle ?? '');
  const [content, setContent] = useState(initial.content);
  const [images, setImages] = useState<string[]>(initial.images);
  const [taggedProduct, setTaggedProduct] = useState<TaggedProduct | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isNotice, setIsNotice] = useState(false);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;

    const remaining = MAX_POST_IMAGES - images.length;
    if (remaining <= 0) {
      toast(`이미지는 최대 ${MAX_POST_IMAGES}장까지 올릴 수 있어요.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    const validFiles: File[] = [];

    for (const file of selected) {
      if (!(ACCEPTED_POST_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        toast('JPG, PNG, WEBP, GIF, AVIF 이미지만 올릴 수 있어요.');
        continue;
      }
      if (file.size > MAX_POST_IMAGE_BYTES) {
        toast('이미지 한 장당 5MB 이하만 올릴 수 있어요.');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploadingImages(true);
    try {
      const uploaded = await Promise.all(
        validFiles.map((file) => ProductService.uploadProductImage(file)),
      );
      setImages((prev) => [...prev, ...uploaded].slice(0, MAX_POST_IMAGES));
    } catch {
      toast('이미지 업로드에 실패했어요.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const { mutate: submitPost, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      const serialized = serializePostContent(content, images);

      if (editPostId) {
        return CommunityService.updatePost({
          id: editPostId,
          content: serialized,
          title: title || undefined,
        });
      }
      return CommunityService.addPost({
        content: serialized,
        title: title || undefined,
        productId: taggedProduct?.id,
        isNotice: isNotice || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CommunityQueries.all() });
      toast(editPostId ? '게시글이 수정되었어요.' : '게시글이 등록되었어요.');

      // ★앱의 네이티브 스택 위에 얹힌 웹뷰면 웹 라우팅을 하지 않는다.
      // 커뮤니티 탭이 네이티브가 된 뒤(2026-09-08) 이 폼만 웹뷰로 남았는데,
      //   - push(COMMUNITY) 는 **웹뷰 안에 web 커뮤니티 목록**을 그려 두 벌이 되고
      //     (iOS 스와이프 말고는 탈출구가 없다)
      //   - back() 은 새 웹뷰라 history 가 비어 **아무 일도 안 일어난다**
      // 대신 네이티브에 뒤로가기를 올려 글쓰기 화면을 닫는다 — 목록 갱신은
      // 앱의 CommunityWriteScreen 이 언마운트에서 캐시를 무효화해 처리한다.
      // useGoBack 이 쓰는 것과 같은 판정·같은 브릿지다.
      if (
        typeof document !== 'undefined' &&
        document.documentElement.dataset.nativeStack === 'true' &&
        isInApp()
      ) {
        WebViewBridge.sendMessage(WebViewEventType.PRESS_BACKBUTTON, null);
        return;
      }

      if (editPostId) {
        router.back();
      } else {
        router.push(PAGE.COMMUNITY);
      }
    },
    onError: () => {
      toast('게시글 등록에 실패했어요.');
    },
  });

  const canSubmit =
    (content.trim().length > 0 || images.length > 0) && !isSubmitting && !isUploadingImages;

  return {
    title,
    setTitle,
    content,
    setContent,
    images,
    uploadImages,
    removeImage,
    isUploadingImages,
    taggedProduct,
    setTaggedProduct,
    isNotice,
    setIsNotice,
    submitPost,
    isSubmitting,
    canSubmit,
    isEdit: !!editPostId,
  };
}
