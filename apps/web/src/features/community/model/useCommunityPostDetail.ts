'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { CommunityService } from '@/shared/api/community/community.service';
import { useToast } from '@/shared/ui/common/Toast';

import { CommunityQueries } from '@/entities/community';

export default function useCommunityPostDetail(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data } = useSuspenseQuery(CommunityQueries.post(id));

  const { mutate: likePost } = useMutation({
    mutationFn: ({ isLike }: { isLike?: boolean }) => CommunityService.likePost(id, isLike),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CommunityQueries.post(id).queryKey });
    },
    onError: () => {
      toast('좋아요 처리에 실패했어요.');
    },
  });

  return {
    post: data?.comment,
    likePost,
  };
}
