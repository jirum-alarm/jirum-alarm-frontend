'use client';

import { useMutation } from '@tanstack/react-query';
import { VisuallyHidden } from 'radix-ui';
import { useState } from 'react';
import { Drawer } from 'vaul';

import { CommunityService } from '@/shared/api/community/community.service';
import { UserReportReason, UserReportTarget } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';
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
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Drawer.Portal>
        <VisuallyHidden.Root>
          <Drawer.Title>글 신고하기</Drawer.Title>
        </VisuallyHidden.Root>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="max-w-mobile-max rounded-t-5 fixed inset-x-0 right-0 bottom-0 left-0 z-[9999] mx-auto h-fit bg-white outline-hidden">
          <div className="flex flex-col px-5 pt-6 pb-8">
            <h2 className="mb-4 text-base font-semibold text-gray-900">글 신고하기</h2>
            <p className="mb-4 text-sm text-gray-500">
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
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300',
                    )}
                  >
                    {selectedReason === reason.value && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-800">{reason.label}</span>
                </button>
              ))}
            </div>

            {selectedReason === UserReportReason.Other && (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="신고 내용을 입력해주세요"
                className="mt-3 h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
              />
            )}

            <div className="mt-6 flex gap-x-3">
              <button
                onClick={handleClose}
                className="flex h-12 flex-1 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-700 transition-transform active:scale-95"
              >
                취소
              </button>
              <button
                onClick={() => report()}
                disabled={!selectedReason || isPending}
                className="bg-primary-500 flex h-12 flex-1 items-center justify-center rounded-lg text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-40"
              >
                신고
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
