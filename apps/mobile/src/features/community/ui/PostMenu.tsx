import React, {useState} from 'react';
import {View} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {CommunityQueries} from '@/entities/community';
import {CommentService} from '@/shared/api/comment/comment.service';
import {showToast} from '@/shared/lib/feedback';

import CommunitySheet from './CommunitySheet';
import ConfirmSheet from './ConfirmSheet';
import ReportSheet from './ReportSheet';
import SheetMenuRow from './SheetMenuRow';

/**
 * 글 더보기 메뉴. web `features/community/ui/PostMenu` 대응 —
 * 내 글이면 삭제·수정, 남의 글이면 신고다.
 *
 * 트리거(⋯)는 헤더에 있어 **화면이 들고 있다**. 여기는 시트만 담당한다
 * (네이티브 헤더의 headerRight 는 화면만 setOptions 할 수 있다).
 *
 * ★삭제는 `CommentService.removeComment` 를 쓴다 — 커뮤니티 글은 댓글
 * 테이블의 루트 행이라 뮤테이션이 같다. 같은 걸 이름만 바꿔 또 만들지 않는다.
 */
export default function PostMenu({
  visible,
  postId,
  isMyPost,
  onClose,
  onEdit,
  onDeleted,
}: {
  visible: boolean;
  postId: number;
  isMyPost: boolean;
  onClose: () => void;
  onEdit: () => void;
  /** 삭제 성공 후. 화면이 목록으로 빠져나간다. */
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const {mutate: removePost, isPending: isRemoving} = useMutation({
    mutationFn: () => CommentService.removeComment({id: postId}),
    onSuccess: () => {
      // web 과 같이 커뮤니티 캐시를 통째로 무효화한다 — 목록 3개 탭 어디에
      // 남아 있어도 지워져야 한다.
      queryClient.invalidateQueries({queryKey: CommunityQueries.keys.all});
      setConfirmOpen(false);
      showToast.info('게시글이 삭제되었어요.');
      onDeleted();
    },
    onError: () => {
      setConfirmOpen(false);
      showToast.info('삭제에 실패했어요.');
    },
  });

  return (
    <>
      <CommunitySheet
        visible={visible}
        onClose={onClose}
        accessibilityLabel="게시글 메뉴">
        <View className="pb-4">
          {isMyPost ? (
            <>
              <SheetMenuRow
                label="글 삭제하기"
                tone="danger"
                onPress={() => {
                  onClose();
                  setConfirmOpen(true);
                }}
              />
              <View className="mx-5 h-px bg-gray-200" />
              <SheetMenuRow
                label="글 수정하기"
                onPress={() => {
                  onClose();
                  onEdit();
                }}
              />
            </>
          ) : (
            <SheetMenuRow
              label="글 신고하기"
              tone="danger"
              onPress={() => {
                onClose();
                setReportOpen(true);
              }}
            />
          )}
        </View>
      </CommunitySheet>

      <ConfirmSheet
        visible={confirmOpen}
        title="글을 삭제할까요?"
        description="글을 삭제하면 다시 복구할 수 없어요."
        confirmLabel="삭제"
        loading={isRemoving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => removePost()}
      />

      <ReportSheet
        visible={reportOpen}
        postId={postId}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
