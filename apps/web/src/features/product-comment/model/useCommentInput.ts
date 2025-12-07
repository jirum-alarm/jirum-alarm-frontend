'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import {
  CANCEL_EVENT,
  CommentQueries,
  defaultCommentsVariables,
  TComment,
  TEditStatus,
} from '@entities/comment';

import { CommentService } from '@/shared/api/comment';

export const useCommentInput = ({
  productId,
  editingComment,
}: {
  productId: number;
  editingComment: {
    comment: TComment;
    status: TEditStatus;
  } | null;
}) => {
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!editingComment) {
      setComment('');
    } else {
      const isUpdate = editingComment.status === 'update';

      const nextComment = isUpdate ? editingComment.comment.content : '';

      setComment(nextComment);

      setTimeout(
        () => {
          ref.current?.focus();
        },
        isUpdate ? 1000 : 0,
      );
    }
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
