import { useSuspenseQuery } from '@tanstack/react-query';

import ShareButton from '@/shared/ui/ShareButton';

import { CommunityQueries } from '@/entities/community';

export default function CommunityShareButton({ postId }: { postId: number }) {
  const { data, isLoading } = useSuspenseQuery(CommunityQueries.post(postId));

  if (isLoading) return null;

  const post = data?.comment;
  const title = `${post?.title || '커뮤니티'} | 지름알림`;

  return <ShareButton title={title} page="DETAIL" />;
}
