'use client';

import { ProductCommentSummary } from '@/shared/api/gql/graphql';
import { AIIcon } from '@/shared/ui/common/icons';

export function ReactionSummary({
  commentSummary,
}: {
  commentSummary: ProductCommentSummary;
  provider: string;
  url: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <AIIcon className="size-4.5" />
        <span className="font-medium text-gray-900">핫딜 추천 이유</span>
      </div>
      <p className="p-1 text-sm text-gray-800">{commentSummary.summary}</p>
    </section>
  );
}
