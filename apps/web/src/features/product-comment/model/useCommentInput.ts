'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { CommentService } from '@/shared/api/comment';

import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';

import { CANCEL_EVENT, TComment, TEditStatus } from '../ui/CommentLayout';

type EditingComment = {
  comment: TComment;
  status: TEditStatus;
} | null;

const initialCommentFor = (editingComment: EditingComment) =>
  editingComment?.status === 'update' ? editingComment.comment.content : '';

export const useCommentInput = ({
  productId,
  editingComment,
}: {
  productId: number;
  editingComment: EditingComment;
}) => {
  const queryClient = useQueryClient();

  const [comment, setComment] = useState(() => initialCommentFor(editingComment));
  const ref = useRef<HTMLTextAreaElement>(null);

  // 수정/답글 대상이 바뀌면 입력값을 그에 맞게 다시 채운다 — effect 대신 렌더 중 비교로.
  const [syncedEditingComment, setSyncedEditingComment] = useState(editingComment);
  if (editingComment !== syncedEditingComment) {
    setSyncedEditingComment(editingComment);
    setComment(initialCommentFor(editingComment));
  }

  const { mutate: addComment } = useMutation({
    mutationFn: CommentService.addComment,
    onSuccess: () => {
      document.dispatchEvent(new CustomEvent(CANCEL_EVENT));

      // TODO: Need GTM Migration
      queryClient.invalidateQueries({
        queryKey: CommentQueries.infiniteComments({
          productId,
          ...defaultCommentsVariables,
        }).queryKey,
      });
    },
  });

  const { mutate: updateComment } = useMutation({
    mutationFn: CommentService.updateComment,
    onSuccess: () => {
      document.dispatchEvent(new CustomEvent(CANCEL_EVENT));

      // TODO: Need GTM Migration
      queryClient.invalidateQueries({
        queryKey: CommentQueries.infiniteComments({
          productId,
          ...defaultCommentsVariables,
        }).queryKey,
      });
    },
  });

  // 포커스는 DOM(외부) 조작이라 effect 에 남긴다.
  useEffect(() => {
    if (!editingComment) return;
    setTimeout(
      () => {
        ref.current?.focus();
      },
      editingComment.status === 'update' ? 1000 : 0,
    );
  }, [editingComment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.currentTarget;
    setComment(value);
  };
  const reset = () => {
    setComment('');
  };
  const canSubmit = !!comment;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingComment) {
      addComment({ content: comment, productId });
    } else {
      if (editingComment.status === 'update') {
        updateComment({
          content: comment,
          id: Number(editingComment.comment.id),
        });
      } else {
        addComment({
          content: comment,
          productId,
          parentId: Number(editingComment.comment.id),
        });
      }
    }
    reset();
  };
  return { handleInputChange, comment, handleSubmit, canSubmit, ref };
};
