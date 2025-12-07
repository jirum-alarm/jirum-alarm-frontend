'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import {
  CANCEL_EVENT,
  CommentQueries,
  defaultCommentsVariables,
  REPLY_EVENT,
  TComment,
  TEditStatus,
  UPDATE_EVENT,
} from '@entities/comment';

export const editingCommentAtom = atom<{
  comment: TComment;
  status: TEditStatus;
} | null>(null);

export default function useComment(productId: number) {
  const [editingComment, setEditingComment] = useAtom(editingCommentAtom);

  const {
    data: { pages },
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    CommentQueries.infiniteComments({
      productId,
      ...defaultCommentsVariables,
    }),
  );

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  useEffect(() => {
    const cancel = () => setEditingComment(null);
    const reply = (e: Event) => {
      const customEvent = e as CustomEvent<TComment>;
      setEditingComment({ comment: customEvent.detail, status: 'reply' });
    };
    const update = (e: Event) => {
      const customEvent = e as CustomEvent<TComment>;
      setEditingComment({ comment: customEvent.detail, status: 'update' });
    };

    document.addEventListener(CANCEL_EVENT, cancel);
    document.addEventListener(REPLY_EVENT, reply);
    document.addEventListener(UPDATE_EVENT, update);

    return () => {
      document.removeEventListener(CANCEL_EVENT, cancel);
      document.removeEventListener(REPLY_EVENT, reply);
      document.removeEventListener(UPDATE_EVENT, update);
    };
  }, [setEditingComment]);

  return {
    editingComment,
    ref,
    pages,
    isFetchingNextPage,
  };
}
