import React, {useEffect, useRef, useState} from 'react';
import {Animated, Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onRemove: () => void;
};

/**
 * 댓글 수정/삭제 시트.
 *
 * ponytail: web 은 vaul 을 쓰지만 여기 내용물은 버튼 2개뿐이다 — 스냅 포인트도,
 * 스크롤도, 키보드 상호작용도 없다. @gorhom/bottom-sheet 를 넣으면 안 쓰는 기능
 * 때문에 reanimated 버전 리스크만 진다(이 앱은 worklets 0.5.1 에 핀돼 있다).
 * 시트가 3곳 이상으로 늘거나 스냅/스크롤이 필요해지면 그때 도입.
 */
export default function CommentMenu({
  visible,
  onClose,
  onUpdate,
  onRemove,
}: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  // Modal 은 언마운트 애니메이션을 못 하므로, 닫힐 때 잠깐 더 살려둔다.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(slide, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) setMounted(false);
    });
  }, [visible, slide]);

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        accessibilityLabel="닫기">
        {/* 시트 안쪽 탭이 백드롭으로 새어 닫히지 않도록 흡수한다. */}
        <Pressable onPress={() => {}}>
          <Animated.View
            className="rounded-t-2xl bg-white px-5 pt-2"
            style={{
              paddingBottom: Math.max(insets.bottom, 12),
              opacity: slide,
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}>
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-gray-200" />
            <Pressable
              className="py-4"
              onPress={onUpdate}
              accessibilityRole="button">
              <Text className="text-base text-gray-900">수정하기</Text>
            </Pressable>
            <Pressable
              className="py-4"
              onPress={onRemove}
              accessibilityRole="button">
              <Text className="text-base text-error-500">삭제하기</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
