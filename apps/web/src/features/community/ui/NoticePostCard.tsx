'use client';

import Link from 'next/link';

import { CommunityPostsQuery } from '@/shared/api/community/community.service';
import { PAGE } from '@/shared/config/page';
import { displayTime } from '@/shared/lib/utils/displayTime';

type Post = CommunityPostsQuery['comments'][number];

export default function NoticePostCard({ post, isNew }: { post: Post; isNew?: boolean }) {
  return (
    <Link
      href={`${PAGE.COMMUNITY}/${post.id}`}
      className="flex flex-col border-b border-gray-100 px-5 py-4 hover:bg-gray-50 active:bg-gray-50"
    >
      <div className="flex items-center gap-x-2">
        <span className="bg-primary-500 rounded px-1.5 py-0.5 text-xs font-semibold text-white">
          지름알림
        </span>
        <span className="text-xs text-gray-400">{displayTime(post.createdAt)}</span>
        {isNew && (
          <span className="bg-secondary-500 rounded px-1.5 py-0.5 text-xs font-semibold text-white">
            NEW
          </span>
        )}
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-gray-900">
        {post.title ?? post.content}
      </p>
      {post.title && <p className="mt-0.5 truncate text-sm text-gray-600">{post.content}</p>}

      <div className="mt-2 flex items-center gap-x-3 text-xs text-gray-400">
        {post.likeCount > 0 && (
          <span className="flex items-center gap-x-0.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <path d="M6 10.5S1 7.5 1 4a2.5 2.5 0 0 1 5-0c0 0 0 0 0 0a2.5 2.5 0 0 1 5 0c0 3.5-5 6.5-5 6.5z" />
            </svg>
            {post.likeCount}
          </span>
        )}
        {post.viewCount > 0 && (
          <span className="flex items-center gap-x-0.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <ellipse cx="6" cy="6" rx="5" ry="3.5" />
              <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            {post.viewCount}
          </span>
        )}
      </div>
    </Link>
  );
}
