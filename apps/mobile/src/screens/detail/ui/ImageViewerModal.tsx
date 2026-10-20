import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {Image} from 'expo-image';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {fixed} from '@jirum/design-system';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

/**
 * 상품 사진 크게 보기 — 검은 바탕 전체 화면(web 상세의 사진 뷰어와 같은 동작).
 * 닫기: ✕ 버튼·탭(확대 안 했을 때)·안드로이드 뒤로가기. 확대: 두 손가락·두 번 탭, 확대한 채 끌어서 이동.
 *
 * 새 네이티브 모듈 없이 이미 있는 RNGH·Reanimated·expo-image 로만 만든다 — JS 변경이라 OTA 로 나간다.
 * RN Modal 은 앱 루트 밖에 따로 그려져 App.tsx 의 GestureHandlerRootView 가 닿지 않는다 → 안에 하나 더 둔다.
 */
export default function ImageViewerModal({
  uri,
  fallbackUri,
  onClose,
}: {
  /** null 이면 닫힘. */
  uri: string | null;
  /** uri 를 못 받으면(webp 없음 등) 이걸로. */
  fallbackUri?: string | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      {uri ? (
        <ZoomStage
          key={uri}
          uri={uri}
          fallbackUri={fallbackUri}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function ZoomStage({
  uri,
  fallbackUri,
  onClose,
}: {
  uri: string;
  fallbackUri?: string | null;
  onClose: () => void;
}) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState(uri);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      'worklet';
      scale.value = Math.min(
        MAX_SCALE,
        Math.max(1, savedScale.value * e.scale),
      );
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  // 확대했을 때만 끌어서 옮긴다(1배면 움직일 곳이 없다).
  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(e => {
      'worklet';
      if (scale.value <= 1) return;
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      'worklet';
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      const next = scale.value > 1 ? 1 : DOUBLE_TAP_SCALE;
      scale.value = withTiming(next);
      savedScale.value = next;
      if (next === 1) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  // 한 번 탭 = 닫기(확대 중이면 무시 — 옮기다 손을 뗀 것일 수 있다). 닫기는 React state 라 JS 스레드에서.
  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success && scale.value <= 1.01) onClose();
    });

  const gesture = Gesture.Simultaneous(
    pinch,
    pan,
    Gesture.Exclusive(doubleTap, singleTap),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: tx.value},
      {translateY: ty.value},
      {scale: scale.value},
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <View
        className="flex-1 bg-fixed-900"
        accessibilityViewIsModal
        onAccessibilityEscape={onClose}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.stage, animatedStyle]}>
            <Image
              source={{uri: source}}
              style={{width, height}}
              contentFit="contain"
              cachePolicy="memory-disk"
              accessibilityLabel="상품 사진"
              onError={() => {
                if (fallbackUri && source !== fallbackUri)
                  setSource(fallbackUri);
              }}
            />
          </Animated.View>
        </GestureDetector>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          className="absolute right-3 size-11 items-center justify-center rounded-full bg-fixed-900/60"
          style={{top: insets.top + 8}}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 6l12 12M18 6L6 18"
              stroke={fixed.white}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  stage: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
