import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Clipboard,
  Modal,
  Pressable,
  Share,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {showToast} from '@/shared/lib/feedback';
import {openInAppBrowser} from '@/shared/lib/navigation';

type Channel = {key: string; label: string; emoji: string};

/**
 * web ShareSheet 와 같은 채널 목록.
 *
 * OS 시트만 띄우면 국내 1순위인 카톡이 두 탭 뒤로 밀린다 — 그래서 채널을 먼저
 * 고르게 하고, OS 시트는 "기타"로 남긴다(web 주석의 근거 그대로).
 */
const CHANNELS: Channel[] = [
  {key: 'kakao', label: '카카오톡', emoji: '💬'},
  {key: 'x', label: 'X', emoji: '𝕏'},
  {key: 'threads', label: '스레드', emoji: '@'},
  {key: 'copy', label: '링크 복사', emoji: '🔗'},
  {key: 'etc', label: '기타', emoji: '···'},
];

export default function ShareSheet({
  visible,
  onClose,
  title,
  url,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  url: string;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
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
    }).start(({finished}) => finished && setMounted(false));
  }, [visible, slide]);

  const handle = async (key: string) => {
    onClose();
    const text = `${title}\n${url}`;
    switch (key) {
      case 'kakao':
        // 앱에 카카오 공유 SDK 배선이 없다. 링크를 카톡 공유 인텐트로 넘기는
        // 대신 OS 시트를 띄운다 — 카톡이 목록 상단에 뜬다.
        await Share.share({message: text});
        break;
      case 'x':
        openInAppBrowser(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title,
          )}&url=${encodeURIComponent(url)}`,
        );
        break;
      case 'threads':
        openInAppBrowser(
          `https://www.threads.net/intent/post?text=${encodeURIComponent(
            text,
          )}`,
        );
        break;
      case 'copy':
        Clipboard.setString(url);
        showToast.info('링크를 복사했어요');
        break;
      default:
        await Share.share({message: text});
    }
  };

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        accessibilityLabel="닫기">
        <Pressable onPress={() => {}}>
          <Animated.View
            className="rounded-t-2xl bg-white px-5 pt-4"
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
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-200" />
            <Text className="pb-3 text-base font-semibold text-gray-900">
              공유하기
            </Text>
            <View className="flex-row flex-wrap">
              {CHANNELS.map(c => (
                <Pressable
                  key={c.key}
                  onPress={() => handle(c.key)}
                  className="w-1/5 items-center py-3"
                  accessibilityRole="button"
                  accessibilityLabel={c.label}>
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Text className="text-lg">{c.emoji}</Text>
                  </View>
                  <Text className="pt-1.5 text-xs text-gray-600">
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
