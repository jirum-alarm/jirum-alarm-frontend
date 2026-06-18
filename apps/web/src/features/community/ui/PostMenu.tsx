'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CommunityService } from '@/shared/api/community/community.service';
import { PAGE } from '@/shared/config/page';
import {
  Action,
  AlertDialog,
  Cancel,
  Content,
  Description,
  Footer,
  Header,
  Title,
} from '@/shared/ui/common/AlertDialog/AlertDialog';
import BottomSheet from '@/shared/ui/common/BottomSheet';
import Dots from '@/shared/ui/common/icons/Dots';
import { useToast } from '@/shared/ui/common/Toast';

import { CommunityQueries } from '@/entities/community';

import ReportModal from './ReportModal';

export default function PostMenu({ postId, isMyPost }: { postId: number; isMyPost: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { mutate: removePost } = useMutation({
    mutationFn: () => CommunityService.removePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CommunityQueries.all() });
      toast('게시글이 삭제되었어요.');
      router.push(PAGE.COMMUNITY);
    },
    onError: () => {
      toast('삭제에 실패했어요.');
    },
  });

  return (
    <>
      <BottomSheet
        onOpenChange={setIsOpen}
        open={isOpen}
        title="게시글 메뉴"
        trigger={
          <button className="h-6 w-6 bg-transparent transition-transform active:scale-95">
            <Dots width={24} height={24} />
          </button>
        }
      >
        <div className="flex flex-col items-center pt-4 pb-8">
          {isMyPost ? (
            <>
              <button
                className="text-fg-error flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
                onClick={() => {
                  setIsOpen(false);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                글 삭제하기
              </button>
              <div className="bg-surface-emphasis mx-5 h-px w-full" />
              <button
                className="text-fg-strong flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
                onClick={() => {
                  setIsOpen(false);
                  router.push(`${PAGE.COMMUNITY_WRITE}?edit=${postId}`);
                }}
              >
                글 수정하기
              </button>
            </>
          ) : (
            <button
              className="text-fg-error flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
              onClick={() => {
                setIsOpen(false);
                setIsReportOpen(true);
              }}
            >
              글 신고하기
            </button>
          )}
        </div>
      </BottomSheet>

      {isDeleteConfirmOpen && (
        <AlertDialog
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open) setIsDeleteConfirmOpen(false);
          }}
        >
          <Content>
            <Header>
              <Title className="typography-title-16sb text-fg-primary">글을 삭제할까요?</Title>
              <Description className="text-fg-secondary typography-body-14r">
                글을 삭제하면 다시 복구할 수 없어요.
              </Description>
            </Header>
            <Footer>
              <Cancel className="typography-body-14m bg-surface-muted text-fg-secondary-strong flex h-11 flex-1 items-center justify-center rounded-lg">
                취소
              </Cancel>
              <Action
                className="bg-error-500 typography-body-14m text-fg-inverse flex h-11 flex-1 items-center justify-center rounded-lg"
                onClick={() => removePost()}
              >
                삭제
              </Action>
            </Footer>
          </Content>
        </AlertDialog>
      )}

      <ReportModal postId={postId} isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  );
}
