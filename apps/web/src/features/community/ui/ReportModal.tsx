'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { CommunityService } from '@/shared/api/community/community.service';
import { UserReportReason, UserReportTarget } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';
import BottomSheet from '@/shared/ui/common/BottomSheet';
import { useToast } from '@/shared/ui/common/Toast';

const REPORT_REASONS: { label: string; value: UserReportReason }[] = [
  { label: '불법 정보', value: UserReportReason.Abuse },
  { label: '스팸', value: UserReportReason.Spam },
  { label: '욕설 / 혐오 표현', value: UserReportReason.Inappropriate },
  { label: '개인정보 침해', value: UserReportReason.Privacy },
  { label: '기타', value: UserReportReason.Other },
];

export default function ReportModal({
  postId,
  isOpen,
  onClose,
}: {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<UserReportReason | null>(null);
  const [description, setDescription] = useState('');

  const { mutate: report, isPending } = useMutation({
    mutationFn: () =>
      CommunityService.reportPost({
        targetId: postId,
        target: UserReportTarget.Comment,
        reason: selectedReason!,
        description: selectedReason === UserReportReason.Other ? description : undefined,
      }),
    onSuccess: () => {
      toast('신고가 접수되었어요.');
      handleClose();
    },
    onError: () => {
      toast('신고에 실패했어요.');
    },
  });

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  return (
    <BottomSheet open={isOpen} onOpenChange={(open) => !open && handleClose()} title="글 신고하기">
      <div className="flex flex-col px-5 pt-6 pb-8">
        <h2 className="typography-title-16sb text-fg-primary mb-4">글 신고하기</h2>
        <p className="text-fg-secondary typography-body-14r mb-4">
          신고 사유를 선택하면 운영팀이 검토 후 처리해드릴게요.
        </p>

        <div className="flex flex-col gap-y-3">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className="flex items-center gap-x-3 text-left transition-transform active:scale-[0.99]"
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  selectedReason === reason.value
                    ? 'border-border-brand bg-surface-brand'
                    : 'border-border-strong',
                )}
              >
                {selectedReason === reason.value && (
                  <div className="bg-surface-default h-2 w-2 rounded-full" />
                )}
              </div>
              <span className="text-fg-strong typography-body-14r">{reason.label}</span>
            </button>
          ))}
        </div>

        {selectedReason === UserReportReason.Other && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="신고 내용을 입력해주세요"
            className="border-border-default text-fg-primary typography-body-14r focus:border-border-interactive mt-3 h-24 w-full resize-none rounded-lg border p-3 placeholder-gray-400 outline-none"
          />
        )}

        <div className="mt-6 flex gap-x-3">
          <button
            onClick={handleClose}
            className="typography-body-14m bg-surface-muted text-fg-secondary-strong flex h-12 flex-1 items-center justify-center rounded-lg transition-transform active:scale-95"
          >
            취소
          </button>
          <button
            onClick={() => report()}
            disabled={!selectedReason || isPending}
            className="bg-surface-brand typography-body-14m text-fg-inverse flex h-12 flex-1 items-center justify-center rounded-lg transition-transform active:scale-95 disabled:opacity-40"
          >
            신고
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
