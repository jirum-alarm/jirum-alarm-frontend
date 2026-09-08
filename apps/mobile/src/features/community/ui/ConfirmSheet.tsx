import React from 'react';
import {Text, View} from 'react-native';

import Button from '@/shared/components/ui/Button';

import CommunitySheet from './CommunitySheet';
import {gaps} from './community-styles';

/**
 * 되돌릴 수 없는 동작의 확인. web 은 `AlertDialog`(가운데 팝업)를 쓰지만
 * 앱은 시트로 통일한다 — `ProductReport` 가 이미 그렇게 하고 있고,
 * 같은 화면에서 메뉴는 아래, 확인은 가운데로 튀면 흐름이 끊긴다.
 */
export default function ConfirmSheet({
  visible,
  title,
  description,
  confirmLabel,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <CommunitySheet
      visible={visible}
      onClose={onCancel}
      accessibilityLabel={title}>
      <View className="px-5 pt-4">
        <Text className="text-center text-lg font-bold text-gray-900">
          {title}
        </Text>
        {description ? (
          <Text className="pt-2 text-center text-sm text-gray-600">
            {description}
          </Text>
        ) : null}
        <View className="flex-row pt-6" style={gaps.g12}>
          <Button color="secondary" className="flex-1" onPress={onCancel}>
            취소
          </Button>
          <Button className="flex-1" loading={loading} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </View>
      </View>
    </CommunitySheet>
  );
}
