'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { CommunityQueries } from '@/entities/community';

import PostForm from './PostForm';

function PostFormWithData({ editPostId }: { editPostId: number }) {
  const { data } = useSuspenseQuery(CommunityQueries.post(editPostId));
  const post = data?.comment;

  const taggedProduct =
    post?.taggedProduct?.id && post.taggedProduct.id !== '0'
      ? {
          id: Number(post.taggedProduct.id),
          title: post.taggedProduct.title,
          thumbnail: post.taggedProduct.thumbnail,
          price: post.taggedProduct.price,
        }
      : null;

  return (
    <PostForm
      editPostId={editPostId}
      initialContent={post?.content ?? ''}
      existingTitle={post?.title ?? undefined}
      existingTaggedProduct={taggedProduct}
    />
  );
}

export default function PostFormClient({ editPostId }: { editPostId?: number }) {
  if (editPostId) {
    return (
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col px-5 pt-4">
            <div className="mb-3 h-5 w-1/2 animate-pulse rounded bg-gray-100 pb-3" />
            <div className="flex flex-col gap-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        }
      >
        <PostFormWithData editPostId={editPostId} />
      </Suspense>
    );
  }

  return <PostForm />;
}
