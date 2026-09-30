import React from 'react';
import {View} from 'react-native';

import BottomSheet from '@/shared/components/BottomSheet';
import SheetMenuRow from '@/shared/components/SheetMenuRow';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onRemove: () => void;
};

/**
 * 상품 댓글 수정/삭제 시트. 커뮤니티 댓글 메뉴(`CommunityCommentItem`)와 같은
 * 시트·줄 모양을 쓴다 — 같은 "댓글 ⋯" 인데 화면마다 메뉴가 달라 보이면 안 된다.
 * 닫기 줄은 두지 않는다(커뮤니티 메뉴와 같이 백드롭·두 손가락 Z 로 닫힌다).
 */
export default function CommentMenu({
  visible,
  onClose,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel="댓글 메뉴">
      <View className="pb-4">
        <SheetMenuRow label="수정하기" onPress={onUpdate} />
        <View className="mx-5 h-px bg-gray-200" />
        <SheetMenuRow label="삭제하기" tone="danger" onPress={onRemove} />
      </View>
    </BottomSheet>
  );
}
