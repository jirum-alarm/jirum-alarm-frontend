'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CommunityService } from '@/shared/api/community/community.service';
import { PAGE } from '@/shared/config/page';
import { useToast } from '@/shared/ui/common/Toast';

import { CommunityQueries } from '@/entities/community';

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

  const [title, setTitle] = useState(initialTitle ?? '');
  const [content, setContent] = useState(initialContent ?? '');
  const [taggedProduct, setTaggedProduct] = useState<TaggedProduct | null>(null);

  const { mutate: submitPost, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (editPostId) {
        return CommunityService.updatePost({
          id: editPostId,
          content,
          title: title || undefined,
        });
      }
      return CommunityService.addPost({
        content,
        title: title || undefined,
        productId: taggedProduct?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CommunityQueries.all() });
      if (editPostId) {
        toast('게시글이 수정되었어요.');
        router.back();
      } else {
        toast('게시글이 등록되었어요.');
        router.push(PAGE.COMMUNITY);
      }
    },
    onError: () => {
      toast('게시글 등록에 실패했어요.');
    },
  });

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return {
    title,
    setTitle,
    content,
    setContent,
    taggedProduct,
    setTaggedProduct,
    submitPost,
    isSubmitting,
    canSubmit,
    isEdit: !!editPostId,
  };
}
