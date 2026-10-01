import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * 아래에서 올라오는 시트 — 앱의 바텀시트는 전부 이것 하나를 쓴다
 * (커뮤니티 글·댓글 메뉴, 신고, 확인, 상품 댓글 메뉴, 종료 제보, 출생 연도, 핫딜 기준).
 * 예전엔 7곳이 제각각 라운드(16/20/24)·백드롭(40/50%)·애니메이션을 따로 들고 있어
 * 화면마다 시트 모양이 달랐다. 공유 시트(ShareSheet)만 iOS 공유 시트 모양이라 따로 둔다.
 *
 * ponytail: web 은 `vaul` 을 쓰지만 여기 내용물은 버튼 몇 개와 목록뿐이다 —
 * 스냅 포인트는 필요 없고, 끌어서 닫기는 PanResponder 로 충분하다. 바텀시트 라이브러리를 새로 넣으면
 * 안 쓰는 기능 때문에 reanimated 버전 리스크만 진다.
 *
 * ★`Animated.View` 에는 **className 을 주지 않는다** — NativeWind 는 기본
 * 컴포넌트만 스타일을 처리해서 Animated 컴포넌트의 className 이 조용히
 * 사라진다(배경·라운드가 통째로 안 먹는다). 여기 스타일은 전부 StyleSheet.
 *
 * ★iOS 는 Modal 위에 Modal 을 띄우면 두 번째가 안 뜰 수 있다 — 메뉴 시트에서
 * 확인 시트로 넘어갈 땐 메뉴를 먼저 닫고(visible=false) 확인을 연다.
 */
export default function BottomSheet({
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
  // 0 = 닫힘, 1 = 열림. 백드롭 투명도와 시트 위치가 같은 값을 따라간다 —
  // 예전엔 백드롭이 고정색이라 열리는 순간 40% 로 툭 켜지고 닫힐 때 툭 꺼졌다.
  const progress = useRef(new Animated.Value(0)).current;
  // 손가락으로 끌어내린 거리(px). 놓으면 닫히거나 제자리로 돌아온다.
  const drag = useRef(new Animated.Value(0)).current;
  // 시트를 화면 밖(자기 높이만큼 아래)에서 올리려면 높이가 필요하다 — 첫 레이아웃 전엔 넉넉히.
  const [sheetHeight, setSheetHeight] = useState(480);
  // ★닫을 땐 바로 내린다. 닫힘 애니메이션 동안 Modal(별도 네이티브 창)이 화면을 덮고 남아
  // 있으면, 시트에서 고른 직후의 다음 탭이 그 창에 먹힌다(사용자 지적 "터치가 한 박자 늦다").
  // 닫힘 페이드는 포기한다 — 열릴 때 spring·백드롭 페이드와 끌어서 닫기는 그대로다.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.setValue(0);
      // 토스 시트처럼 살짝 탄력 있게 — 과하게 튀지 않도록 감쇠를 크게.
      Animated.spring(progress, {
        toValue: 1,
        damping: 22,
        stiffness: 260,
        mass: 0.9,
        useNativeDriver: true,
      }).start();
      return;
    }
    progress.setValue(0);
    setMounted(false);
  }, [visible, progress, drag]);

  /**
   * 끌어서 닫기 — 손잡이를 그려 놓고 못 끄는 게 어색했다. 아래로 세로 이동일 때만 잡는다
   * (버블 단계라 안쪽 ScrollView 스크롤·가로 스와이프는 그대로 자식 몫).
   * ponytail: RN PanResponder 로 충분하다. 스냅 포인트가 생기면 gesture-handler 로.
   */
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 6 && g.dy > Math.abs(g.dx),
        onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy > 80 || g.vy > 0.8) {
            onClose();
            return;
          }
          Animated.spring(drag, {
            toValue: 0,
            damping: 20,
            stiffness: 300,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(drag, {toValue: 0, useNativeDriver: true}).start();
        },
      }),
    [drag, onClose],
  );

  if (!mounted) return null;

  const translateY = Animated.add(
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [sheetHeight, 0],
    }),
    drag,
  );

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/*
        ★백드롭은 시트의 **형제**다(ShareSheet 와 같은 구조). 예전엔 백드롭 Pressable 이
        시트를 감쌌는데, iOS 는 누를 수 있는 부모를 요소 하나로 묶어 VoiceOver 가
        "닫기" 만 읽고 안쪽 버튼에 닿지 못했다. 키보드가 뜨면 시트째 올린다('기타' 신고 사유).
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        accessibilityViewIsModal
        // VoiceOver 두 손가락 Z — 닫기 버튼이 없는 시트도 빠져나올 수 있게.
        onAccessibilityEscape={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            {opacity: progress},
          ]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          />
        </Animated.View>
        <Animated.View
          {...pan.panHandlers}
          // 시트 안쪽 탭이 백드롭으로 새어 닫히지 않도록 흡수한다.
          onStartShouldSetResponder={() => true}
          onLayout={e => setSheetHeight(e.nativeEvent.layout.height)}
          aria-label={accessibilityLabel}
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{translateY}],
            },
          ]}>
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
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
    backgroundColor: '#E4E7EC', // gray-200
    marginBottom: 12,
  },
});
