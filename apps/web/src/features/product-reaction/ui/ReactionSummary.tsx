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
        <span className="text-fg-primary font-medium">핫딜 추천 이유</span>
      </div>
      <p className="text-fg-strong typography-body-14r p-1">{commentSummary.summary}</p>
    </section>
  );
}
