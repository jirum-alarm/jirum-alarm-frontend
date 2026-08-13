import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Clipboard,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

import CircleX from '@/shared/components/icons/circle_x';
import KaKaoIcon from '@/shared/components/icons/kakao';
import ShareIcon from '@/shared/components/icons/share';
import ShareLink from '@/shared/components/icons/share-link';
import ShareThreads from '@/shared/components/icons/share-threads';
import ShareX from '@/shared/components/icons/share-x';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';
import {showToast} from '@/shared/lib/feedback';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {
  buildCaption,
  buildIntentUrl,
  buildKakaoAndroidSendIntent,
  buildKakaoLinkUrl,
  buildProductShareUrl,
  buildShareMessage,
  type ShareChannel,
} from '@/shared/lib/share';

type Props = {
  visible: boolean;
  onClose: () => void;
  productId: number;
  title: string;
  description?: string;
  imageUrl?: string;
};

/** 시트 높이보다 크게 — 화면 아래에서 올라오게. */
const SLIDE_DISTANCE = 420;

/**
 * iOS UIActivityViewController 위계.
 *
 * 1) 무엇을 보내는지(미리보기)
 * 2) 어디로 보내는지(앱)
 * 3) 시트 안에서 끝나는 동작(복사)
 *
 * 카톡을 노란 풀폭 CTA 로 빼면 웹 시트처럼 보이고, 앱·동작이 한 줄에
 * 섞이면 아이콘이 쪼그라든다. 카톡은 앱 줄의 첫 칸(국내 1순위)이다.
 */
export default function ShareSheet({
  visible,
  onClose,
  productId,
  title,
  description,
  imageUrl,
}: Props) {
  const insets = useSafeAreaInsets();
  const overlay = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const [pending, setPending] = useState<ShareChannel | null>(null);
  const [copied, setCopied] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setCopied(false);
      setThumbFailed(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(sheet, {
          toValue: 1,
          damping: 24,
          stiffness: 260,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheet, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => finished && setMounted(false));
  }, [visible, overlay, sheet]);

  const shareTitle = title.trim() ? `${title.trim()} | 지름알림` : '지름알림';

  const copyLink = (url: string) => {
    Clipboard.setString(buildShareMessage(shareTitle, url, description));
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, 700);
  };

  const share = async (channel: ShareChannel) => {
    if (pending || copied) return;
    setPending(channel);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    MixpanelService.track('share_channel_click', {share_channel: channel});

    const url = buildProductShareUrl(productId, channel);
    const caption = buildCaption(shareTitle, description);
    const message = buildShareMessage(shareTitle, url, description);

    try {
      if (channel === 'kakao') {
        const kakaoUrl =
          Platform.OS === 'android'
            ? buildKakaoAndroidSendIntent(message)
            : buildKakaoLinkUrl({
                title: shareTitle,
                description,
                imageUrl,
                url,
              });
        await Linking.openURL(kakaoUrl);
      } else if (channel === 'x' || channel === 'threads') {
        await openInAppBrowser(buildIntentUrl(channel, caption, url));
      } else if (channel === 'copy') {
        copyLink(url);
        return;
      } else {
        await Share.share({title: shareTitle, message});
      }
      onClose();
    } catch {
      if (channel === 'kakao') {
        showToast.info('카카오톡을 열지 못했어요. 링크 복사를 이용해주세요.');
        return;
      }
      copyLink(url);
    } finally {
      setPending(null);
    }
  };

  if (!mounted) return null;

  const apps: {
    c: Exclude<ShareChannel, 'copy'>;
    label: string;
    icon: React.ReactNode;
    bg: string;
  }[] = [
    {
      c: 'kakao',
      label: '카카오톡',
      icon: <KaKaoIcon width={28} height={28} />,
      bg: '#FEE500',
    },
    {
      c: 'x',
      label: 'X',
      icon: <ShareX width={22} height={22} />,
      bg: '#000000',
    },
    {
      c: 'threads',
      label: '스레드',
      icon: <ShareThreads width={24} height={24} />,
      bg: '#000000',
    },
    {
      c: 'native',
      label: '더보기',
      icon: <ShareIcon width={22} height={22} color="#344054" />,
      bg: '#F2F4F7',
    },
  ];

  return (
    <Modal
      transparent
      visible
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View className="flex-1 justify-end" accessibilityViewIsModal>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, {opacity: overlay}]}>
          <View className="flex-1 bg-black/50" />
        </Animated.View>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="닫기"
          accessibilityRole="button"
        />

        <Animated.View
          onStartShouldSetResponder={() => true}
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [
                {
                  translateY: sheet.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SLIDE_DISTANCE, 0],
                  }),
                },
              ],
            },
          ]}>
          <View className="items-center pt-2.5">
            <View className="h-1 w-9 rounded-full bg-gray-200" />
          </View>

          <View className="flex-row items-start px-5 pt-4">
            <View className="min-w-0 flex-1 flex-row items-center gap-3.5">
              {imageUrl && !thumbFailed ? (
                <Image
                  source={{uri: imageUrl}}
                  className="h-[72px] w-[72px] flex-none rounded-2xl bg-gray-100"
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                  onError={() => setThumbFailed(true)}
                />
              ) : (
                <View className="h-[72px] w-[72px] flex-none items-center justify-center rounded-2xl bg-gray-100">
                  <ShareIcon width={22} height={22} color="#98A2B3" />
                </View>
              )}
              <View className="min-w-0 flex-1 pr-2">
                <Text
                  className="text-[16px] font-semibold leading-[22px] text-gray-900"
                  numberOfLines={2}>
                  {title.trim() || '지름알림'}
                </Text>
                {description ? (
                  <Text
                    className="mt-1 text-[13px] leading-[18px] text-gray-500"
                    numberOfLines={1}>
                    {description}
                  </Text>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="-mr-1 h-8 w-8 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="닫기">
              <CircleX width={28} height={28} />
            </Pressable>
          </View>

          <View
            className="mt-6 flex-row px-2"
            pointerEvents={pending ? 'none' : 'auto'}>
            {apps.map(app => (
              <AppButton
                key={app.c}
                label={app.label}
                bg={app.bg}
                disabled={!!pending}
                onPress={() => share(app.c)}>
                {app.icon}
              </AppButton>
            ))}
          </View>

          <Pressable
            onPress={() => share('copy')}
            disabled={!!pending}
            android_ripple={{color: '#E4E7EC'}}
            className="mx-5 mt-5 flex-row items-center rounded-2xl bg-gray-50 px-3.5"
            style={{height: 56}}
            accessibilityRole="button"
            accessibilityLabel={copied ? '링크 복사됨' : '링크 복사'}>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              {copied ? (
                <CheckIcon />
              ) : (
                <ShareLink width={18} height={18} color="#344054" />
              )}
            </View>
            <Text className="ml-3 flex-1 text-[16px] font-medium text-gray-900">
              링크 복사
            </Text>
            {copied ? (
              <Text className="text-[13px] font-medium text-secondary-600">
                복사됨
              </Text>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function AppButton({
  label,
  bg,
  disabled,
  onPress,
  children,
}: {
  label: string;
  bg: string;
  disabled: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-1 items-center"
      style={({pressed}) => ({opacity: pressed ? 0.72 : 1})}
      accessibilityRole="button"
      accessibilityLabel={`${label}(으)로 공유`}>
      <View
        className="h-16 w-16 items-center justify-center rounded-full"
        style={{backgroundColor: bg}}>
        {children}
      </View>
      <Text
        className="mt-2 text-center text-[12px] font-medium text-gray-600"
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.2 4.2L19 7.5"
        stroke="#3964C7"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // overlay 위에 떠 있어야 백드롭 Pressable 이 시트를 먹지 않는다.
    zIndex: 1,
    shadowColor: '#101828',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
});
