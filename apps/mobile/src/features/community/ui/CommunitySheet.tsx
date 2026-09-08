import React, {useEffect, useRef, useState} from 'react';
import {Animated, Modal, Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * 아래에서 올라오는 시트. 커뮤니티의 글 메뉴·댓글 메뉴·신고가 같이 쓴다.
 *
 * ponytail: web 은 `vaul` 을 쓰지만 여기 내용물은 버튼 몇 개와 라디오 목록뿐이다 —
 * 스냅 포인트도, 드래그도, 스크롤도 필요 없다. 이 레포 관행(`CommentMenu` ·
 * `ProductReport` 의 자작 `Modal`)을 그대로 따른다. 바텀시트 라이브러리를
 * 새로 넣으면 안 쓰는 기능 때문에 reanimated 버전 리스크만 진다.
 *
 * ★`Animated.View` 에는 **className 을 주지 않는다** — NativeWind 는 기본
 * 컴포넌트만 스타일을 처리해서 Animated 컴포넌트의 className 이 조용히
 * 사라진다(배경·라운드가 통째로 안 먹는다). 여기 스타일은 전부 StyleSheet.
 */
export default function CommunitySheet({
  visible,
  onClose,
  accessibilityLabel,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  // Modal 은 언마운트 애니메이션을 못 하므로 닫히는 동안 잠깐 더 살려둔다
  // (CommentMenu 와 같은 처방).
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
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="닫기">
        {/* 시트 안쪽 탭이 백드롭으로 새어 닫히지 않도록 흡수한다. */}
        <Pressable onPress={() => {}} accessibilityLabel={accessibilityLabel}>
          <Animated.View
            style={[
              styles.sheet,
              {
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
              },
            ]}>
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#EAECF0', // gray-200
    marginBottom: 12,
  },
});
