import {UserReportReason, UserReportTarget} from '@/shared/api/gql/graphql';
import type {AddUserReportMutationVariables} from '@/shared/api/gql/graphql';

/**
 * 신고 사유. **순서·문구가 web `ReportModal` 의 REPORT_REASONS 와 같아야 한다** —
 * 같은 글을 웹에서 신고할 때와 앱에서 신고할 때 선택지가 다르면 유저는 버그로 읽는다.
 */
export const REPORT_REASONS: {label: string; value: UserReportReason}[] = [
  {label: '불법 정보', value: UserReportReason.Abuse},
  {label: '스팸', value: UserReportReason.Spam},
  {label: '욕설 / 혐오 표현', value: UserReportReason.Inappropriate},
  {label: '개인정보 침해', value: UserReportReason.Privacy},
  {label: '기타', value: UserReportReason.Other},
];

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
