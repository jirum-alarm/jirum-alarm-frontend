import {REPORT_REASON_OPTIONS} from '@jirum/domain/community';
import {UserReportReason, UserReportTarget} from '@/shared/api/gql/graphql';
import type {AddUserReportMutationVariables} from '@/shared/api/gql/graphql';

/** 신고 사유 — 순서·문구·값은 정본 @jirum/domain/community(web 신고 창과 같은 표). */
export const REPORT_REASONS: {label: string; value: UserReportReason}[] =
  REPORT_REASON_OPTIONS.map(r => ({
    label: r.label,
    value: r.value as UserReportReason,
  }));

/**
 * 신고 뮤테이션 변수.
 *
 * ★description 은 사유가 '기타' 일 때만 보낸다(web 과 같다). 다른 사유에
 * 입력값이 남아 있어도 보내지 않는다 — 사유를 '기타'로 골라 적었다가
 * 마음을 바꿔 '스팸'으로 옮기면, 그 텍스트가 따라가면 안 된다.
 */
export function buildReportVariables({
  postId,
  reason,
  description,
}: {
  postId: number;
  reason: UserReportReason;
  description: string;
}): AddUserReportMutationVariables {
  return {
    target: UserReportTarget.Comment,
    targetId: postId,
    reason,
    description:
      reason === UserReportReason.Other
        ? description.trim() || undefined
        : undefined,
  };
}
