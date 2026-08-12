import {useSyncExternalStore} from 'react';

import type {TComment} from '@/shared/api/comment/comment.service';

export type TEditStatus = 'reply' | 'update';

type EditingComment = {comment: TComment; status: TEditStatus} | null;

/**
 * 답글/수정 대상 댓글.
 *
 * ★ web 은 이 상태를 document.dispatchEvent(CustomEvent) 3종
 * (comment-cancel/reply/update-event)으로 나른다. 하지만 그 이벤트들이 실제로
 * 하는 일은 이 값 하나를 set 하는 것뿐이다 — 버스가 존재하는 이유는 setter 를
 * CommentAction/CommentMenu 로 내려주지 않아서다.
 *
 * RN 에는 document 가 없고, 굳이 이벤트 에미터를 재구현할 이유도 없다.
 * 스토어를 직접 호출한다.
 *
 * ponytail: 전역 변수 + useSyncExternalStore. 상태 하나짜리라 라이브러리 불필요
 * (jotai 가 RN 에서 돌긴 하지만 이거 하나 때문에 의존성을 늘리지 않는다).
 */
let editingComment: EditingComment = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

export function setReplyTarget(comment: TComment) {
  editingComment = {comment, status: 'reply'};
  emit();
}

export function setUpdateTarget(comment: TComment) {
  editingComment = {comment, status: 'update'};
  emit();
}

export function clearEditingComment() {
  if (editingComment === null) return;
  editingComment = null;
  emit();
}

/** useSyncExternalStore 용. 테스트에서도 이 두 개로 스토어를 직접 관찰한다. */
export function subscribeEditingComment(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getEditingComment(): EditingComment {
  return editingComment;
}

export function useEditingComment(): EditingComment {
  return useSyncExternalStore(subscribeEditingComment, getEditingComment);
}

/** 특정 댓글의 편집 상태. 목록에서 행마다 "수정중"/"답글" 표시에 쓴다. */
export function useEditStatusOf(
  commentId: string | number,
): TEditStatus | undefined {
  const editing = useEditingComment();
  if (!editing) return undefined;
  return String(editing.comment.id) === String(commentId)
    ? editing.status
    : undefined;
}
