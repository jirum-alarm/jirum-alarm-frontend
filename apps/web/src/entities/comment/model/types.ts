import { CommentsQuery } from '@/shared/api/gql/graphql';

export type TComment = NonNullable<CommentsQuery['comments']>[number];

export type TEditStatus = 'reply' | 'update';

export const CANCEL_EVENT = 'comment-cancel-event';
export const REPLY_EVENT = 'comment-reply-event';
export const UPDATE_EVENT = 'comment-update-event';
