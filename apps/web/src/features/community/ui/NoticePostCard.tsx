'use client';

import Link from 'next/link';

import { CommunityPostsQuery } from '@/shared/api/community/community.service';
import { PAGE } from '@/shared/config/page';
import { displayTime } from '@/shared/lib/utils/displayTime';
import { BubbleChat, Eye, ThumbsupFill } from '@/shared/ui/common/icons';

import { CommunityTab } from '@/entities/community';

type Post = CommunityPostsQuery['comments'][number];

export default function NoticePostCard({
  post,
  isNew,
  tab,
}: {
  post: Post;
  isNew?: boolean;
  tab: CommunityTab;
}) {
  return (
    <Link
      href={{ pathname: `${PAGE.COMMUNITY}/${post.id}`, query: { tab } }}
      className="flex flex-col border-b border-gray-100 px-5 py-4 transition-transform hover:bg-gray-50 active:scale-[0.98] active:bg-gray-50"
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
        <span className="flex items-center gap-x-1">
          <ThumbsupFill className="h-3.5 w-3.5" aria-hidden />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-x-1">
          <Eye className="h-3.5 w-3.5" width={14} height={14} aria-hidden />
          {post.viewCount}
        </span>
        <span className="flex items-center gap-x-1">
          <BubbleChat className="h-3.5 w-3.5" aria-hidden />
          {post.replyCount}
        </span>
      </div>
    </Link>
  );
}
