import { useSuspenseQuery } from '@tanstack/react-query';

import { User } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';
import { displayTime } from '@/shared/lib/utils/displayTime';

import { AuthQueries } from '@/entities/auth';

import CommentAction from './CommentAction';
import { TComment, TEditStatus } from './CommentLayout';
import CommentMenu from './CommentMenu';

export default function Comment({
  comment,
  editStatus,
  canReply,
}: {
  comment: TComment;
  editStatus?: TEditStatus;
  canReply: boolean;
  drawer?: React.ReactNode;
}) {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());

  const isMyComment = `${comment.author?.id ?? '#no-author'}` === `${me?.id}`;
  const hasParentComment = !!comment.parentId;

  const bgClass = isMyComment
    ? hasParentComment
      ? 'bg-primary-100'
      : 'bg-primary-50'
    : hasParentComment
      ? 'bg-surface-muted'
      : 'bg-surface-default';
  const paddingClass = hasParentComment ? 'pl-8' : '';

  return (
    <div className={cn('flex flex-col px-5 py-4', bgClass, paddingClass)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <span className="typography-body-14m text-fg-muted">{comment.author?.nickname}</span>
          <span className="text-fg-secondary typography-body-14r">
            {editStatus === 'update' ? '수정중' : displayTime(comment.createdAt)}
          </span>
        </div>
        {isMyComment && <CommentMenu comment={comment} />}
      </div>
      <p className="text-fg-primary w-full pt-1 text-base">{comment.content}</p>
      <div className="flex items-center gap-x-2 pt-2">
        <CommentAction
          comment={comment}
          canReply={canReply}
          hasParentComment={hasParentComment}
          editStatus={editStatus}
          isUserLogin={!!me}
        />
      </div>
    </div>
  );
}
