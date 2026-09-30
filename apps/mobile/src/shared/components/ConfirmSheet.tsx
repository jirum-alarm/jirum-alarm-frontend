import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import BottomSheet from '@/shared/components/BottomSheet';
import Button from '@/shared/components/ui/Button';

/**
 * 확인 시트 — 앱의 "정말 할까요?" 는 전부 이것 하나다. web 은 `AlertDialog`
 * (가운데 팝업)를 쓰지만 앱은 시트로 통일한다 — 같은 화면에서 메뉴는 아래,
 * 확인은 가운데로 튀면 흐름이 끊긴다.
 *
 * `tone="danger"` 는 되돌릴 수 없는 동작(삭제·탈퇴)에만 준다 — 로그아웃처럼
 * 다시 하면 되는 동작까지 빨간 버튼이면 경고가 경고로 안 읽힌다.
 */
export default function ConfirmSheet({
  visible,
  title,
  description,
  confirmLabel,
  tone = 'default',
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  /** 문자열이면 기본 설명 스타일로 감싼다. 강조가 섞이면 Text 노드를 직접 넘긴다. */
  description?: React.ReactNode;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onCancel}
      accessibilityLabel={title}>
      <View className="px-5 pt-4">
        <Text className="text-center text-lg font-bold text-gray-900">
          {title}
        </Text>
        {typeof description === 'string' ? (
          <Text className="pt-2 text-center text-sm text-gray-600">
            {description}
          </Text>
        ) : description ? (
          <View className="pt-2">{description}</View>
        ) : null}
        <View className="flex-row pt-6" style={styles.buttons}>
          <Button color="secondary" className="flex-1" onPress={onCancel}>
            취소
          </Button>
          <Button
            color={tone === 'danger' ? 'error' : 'primary'}
            className="flex-1"
            loading={loading}
            onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  buttons: {gap: 12},
});
