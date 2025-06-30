'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from 'vaul';

import Dots from '@/components/common/icons/Dots';
import { useToast } from '@/components/common/Toast';
import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';
import { CommentService } from '@/shared/api/comment/comment.service';

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
          productId: comment.productId,
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
        <button className="h-6 w-6 bg-transparent">
          <Dots width={24} height={24} />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 left-0 right-0 z-[9999] mx-auto h-fit max-w-screen-mobile-max rounded-t-[20px] bg-white outline-none">
          <div className="flex flex-col items-center pb-8 pt-4">
            <button
              className="flex h-[56px] w-full items-center justify-center text-lg font-medium text-error-500"
              onClick={handleRemove}
            >
              삭제
            </button>
            <div className="mx-5 h-[1px] w-full bg-gray-200" />
            <button
              className="flex h-[56px] w-full items-center justify-center text-lg font-medium text-gray-800"
              onClick={handleEdit}
            >
              수정
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
