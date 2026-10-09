'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Drawer } from 'vaul';

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
import { BottomSheetContent } from '@/shared/ui/common/BottomSheet';
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
      <Drawer.Root onOpenChange={setIsOpen} open={isOpen}>
        <Drawer.Trigger asChild>
          <button
            aria-label="게시글 메뉴"
            className="-m-2 box-content h-6 w-6 bg-transparent p-2 transition-transform active:scale-95"
          >
            <Dots width={24} height={24} />
          </button>
        </Drawer.Trigger>
        <BottomSheetContent srTitle="게시글 메뉴">
          <div className="flex flex-col items-center pt-4 pb-8">
            {isMyPost ? (
              <>
                <button
                  className="text-error-500 flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
                  onClick={() => {
                    setIsOpen(false);
                    setIsDeleteConfirmOpen(true);
                  }}
                >
                  글 삭제하기
                </button>
                <div className="mx-5 h-px w-full bg-gray-200" />
                <button
                  className="flex h-14 w-full items-center justify-center text-lg font-medium text-gray-800 transition-transform active:scale-[0.98]"
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
                className="text-error-500 flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
                onClick={() => {
                  setIsOpen(false);
                  setIsReportOpen(true);
                }}
              >
                글 신고하기
              </button>
            )}
          </div>
        </BottomSheetContent>
      </Drawer.Root>

      {isDeleteConfirmOpen && (
        <AlertDialog
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open) setIsDeleteConfirmOpen(false);
          }}
        >
          <Content>
            <Header>
              <Title className="text-base font-semibold text-gray-900">글을 삭제할까요?</Title>
              <Description className="text-sm text-gray-500">
                글을 삭제하면 다시 복구할 수 없어요.
              </Description>
            </Header>
            <Footer>
              <Cancel className="flex h-11 flex-1 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-700">
                취소
              </Cancel>
              <Action
                className="bg-error-500 text-fixed-white flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-medium"
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
