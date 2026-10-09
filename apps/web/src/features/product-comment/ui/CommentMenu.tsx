'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from 'vaul';

import { CommentService } from '@/shared/api/comment/comment.service';
import { BottomSheetContent } from '@/shared/ui/common/BottomSheet';
import Dots from '@/shared/ui/common/icons/Dots';
import { useToast } from '@/shared/ui/common/Toast';

import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';

import { TComment, UPDATE_EVENT } from './CommentLayout';

export default function CommentMenu({ comment }: { comment: TComment }) {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { mutate: removeComment } = useMutation({
    mutationFn: CommentService.removeComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CommentQueries.infiniteComments({
          productId: comment.productId!,
          ...defaultCommentsVariables,
        }).queryKey,
      });
      setIsOpen(false);
      toast('댓글이 삭제되었어요.');
    },
  });

  const handleRemove = () => {
    removeComment({ id: Number(comment.id) });
  };

  const handleEdit = () => {
    setIsOpen(false);
    document.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: comment }));
  };

  return (
    <Drawer.Root onOpenChange={setIsOpen} open={isOpen}>
      <Drawer.Trigger asChild>
        <button aria-label="댓글 메뉴" className="-m-2 box-content h-6 w-6 bg-transparent p-2">
          <Dots width={24} height={24} />
        </button>
      </Drawer.Trigger>
      <BottomSheetContent srTitle="댓글 메뉴">
        <div className="flex flex-col items-center pt-4 pb-8">
          <button
            className="text-error-500 flex h-14 w-full items-center justify-center text-lg font-medium"
            onClick={handleRemove}
          >
            삭제
          </button>
          <div className="mx-5 h-px w-full bg-gray-200" />
          <button
            className="flex h-14 w-full items-center justify-center text-lg font-medium text-gray-800"
            onClick={handleEdit}
          >
            수정
          </button>
        </div>
      </BottomSheetContent>
    </Drawer.Root>
  );
}
