import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Button from '@/shared/components/ui/Button';

/**
 * 확인 시트. web `AlertDialog`(제목 · 설명 · 취소/확인) 대응.
 *
 * ★바텀시트 라이브러리를 넣지 않는다 — 버튼 2개짜리 확인창이라 `Modal` 자작이
 * 이 레포 관행이다(`ProductReport`·`CommentMenu` 와 같은 모양).
 */
export default function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  loading,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}>
      {/* 백드롭이 시트를 감싸 iOS 가 통째로 묶지 않도록 접근성에서 뺀다(안쪽 버튼에 닿게). */}
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onCancel}
        accessible={false}
        accessibilityViewIsModal
        // VoiceOver 두 손가락 Z — 닫기 버튼이 없는 시트도 빠져나올 수 있게.
        onAccessibilityEscape={onCancel}>
        {/* 시트 안쪽 탭이 바깥 닫기로 새지 않게 한 겹 막는다. */}
        <Pressable onPress={() => {}} accessible={false}>
          <View
            className="rounded-t-[20px] bg-white px-5 pt-8"
            style={{paddingBottom: Math.max(insets.bottom, 20)}}>
            <Text className="text-center text-lg font-bold text-gray-900">
              {title}
            </Text>
            <View className="py-3">{description}</View>
            <View className="flex-row gap-3 pt-2">
              <Button
                color="secondary"
                className="flex-1"
                onPress={onCancel}
                accessibilityLabel={cancelLabel}>
                {cancelLabel}
              </Button>
              <Button
                color="error"
                className="flex-1"
                loading={loading}
                onPress={onConfirm}
                accessibilityLabel={confirmLabel}>
                {confirmLabel}
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
