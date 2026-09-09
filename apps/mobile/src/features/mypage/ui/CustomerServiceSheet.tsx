import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebView, {type WebViewMessageEvent} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {SERVICE_URL, USER_AGENT} from '@/constants/env';
import {parsedWebViewMessage, WebViewEventType} from '@/shared/lib/webview';
import {showToast} from '@/shared/lib/feedback/toast';
import Close from '@/shared/components/icons/Close';

/**
 * 고객센터(채널톡). **네이티브로 만들 수 없어 web 페이지를 껍데기 안에 띄운다.**
 *
 * ★왜 웹뷰인가: 채널톡은 web SDK(`cdn.channel.io/plugin/ch-plugin-web.js`)로
 * 붙어 있고, 네이티브 플러그인(`@channel.io/react-native-channel-plugin`)은
 * 설치돼 있지 않다 — 새 네이티브 의존성은 이번 작업 범위 밖이다.
 * 선례는 `SearchScreen`(StackWebView 로 `/search`) 과 같은 방식이다.
 *
 * ★★그런데 `StackWebView` 는 쓸 수 없다: 그건 `path` 를 그냥 열기만 해서
 * **web `/mypage` 가 그대로 보인다** — 방금 네이티브로 만든 화면이 웹 버전으로
 * 한 번 더 나오는, 이 작업에서 가장 피해야 할 모양이다. 그래서 여기서는
 *   1) 페이지 본문을 CSS 로 숨기고(`#ch-plugin` 만 남긴다)
 *   2) 채널톡이 뜨면 그때 웹뷰를 드러낸다
 * 두 가지를 직접 한다.
 *
 * 채널톡이 떴는지는 **web 이 이미 보내주는 브릿지 메시지**로 안다 —
 * `CustomerServiceBoot` 가 `CHANNEL_TALK_VISIBILITY` 를 올린다. 그 값이
 * false 로 돌아오면 유저가 상담창을 닫은 것이므로 시트도 같이 닫는다.
 */

/** web `/mypage` 를 채널톡 전용 화면으로 만든다. 문서 로드 전에도 먹어야 한다. */
const CHANNEL_TALK_ONLY_SCRIPT = `
  (function() {
    // 🔴 Android WebView 의 injectedJavaScriptBeforeContentLoaded 는
    // **documentElement·head 가 아직 null 인** 시점에 돈다. 그대로 두면 아래
    // appendChild 에서 예외가 나고 **IIFE 전체가 죽는다** — CSS 도 폴링도 안 걸려
    // 상담창이 영영 안 뜬다(logcat 실측: "Cannot read properties of null
    // (reading 'appendChild')" @ /mypage). DOM 이 생길 때까지 미룬다.
    function start() {
      if (!document.documentElement) { setTimeout(start, 50); return; }

      if (!document.getElementById('jirum-cs-only')) {
        var style = document.createElement('style');
        style.id = 'jirum-cs-only';
        // ★본문만 숨긴다. 채널톡은 body 밑에 #ch-plugin 을 붙이므로 그건 남긴다.
        style.textContent =
          'body { background: #fff !important; }' +
          'body > *:not(#ch-plugin) { display: none !important; }';
        (document.head || document.documentElement).appendChild(style);
      }
      // 부팅이 끝나야 showMessenger 가 먹는다. 폴링 가드는 dataset 에 둔다 —
      // window 플래그는 문서 로드가 window 를 새로 만들면서 날아가 타이머가
      // 두 벌 돈다(native-stack-script 와 같은 함정).
      if (document.documentElement.dataset.jirumCsHooked === '1') { return; }
      document.documentElement.dataset.jirumCsHooked = '1';
      var tries = 0;
      var timer = setInterval(function() {
        tries += 1;
        if (window.ChannelIO) {
          window.ChannelIO('showMessenger');
          clearInterval(timer);
          return;
        }
        // 20초(100 x 200ms) 안에 안 붙으면 포기하고 **네이티브에 알린다** —
        // 조용히 멈추면 화면이 스피너에 영구히 갇힌다(실측).
        if (tries > 100) {
          clearInterval(timer);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CHANNEL_TALK_VISIBILITY',
              payload: {data: {isOpen: false, failed: true}},
            }));
          }
        }
      }, 200);
    }
    start();
  })();
  true;
`;

export default function CustomerServiceSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [isReady, setReady] = useState(false);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const parsed = parsedWebViewMessage(event);
        if (parsed.type !== WebViewEventType.CHANNEL_TALK_VISIBILITY) return;
        const {isOpen, failed} = (
          parsed.payload as {data: {isOpen: boolean; failed?: boolean}}
        ).data;
        if (isOpen) {
          setReady(true);
          return;
        }
        // ★채널톡 SDK 가 끝내 안 붙은 경우. 스피너로 버티면 화면이 영구히
        // 갇힌다(실측) — 사실을 알리고 닫는다. 웹뷰 버전이 낡은 기기·느린 망에서
        // 실제로 20초를 넘긴다.
        if (failed) {
          showToast.info('상담창을 열지 못했어요. 잠시 후 다시 시도해주세요.');
        }
        // 상담창을 닫으면 뒤에 web /mypage 가 남는다 → 시트를 같이 닫는다.
        setReady(false);
        onClose();
      } catch {
        // 형식이 다른 메시지는 무시한다. 여기선 브릿지 전역 핸들러를 부르지
        // 않는다 — 이 웹뷰는 상담창 전용이라 로그인·공유 같은 걸 다룰 일이 없다.
      }
    },
    [onClose],
  );

  const close = useCallback(() => {
    setReady(false);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={close}
      onDismiss={() => setReady(false)}>
      <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
        {/*
          ★상담창이 뜨기 **전에만** 네이티브 헤더를 둔다.
          채널톡은 자체 헤더(오른쪽 ✕)와 하단 탭을 갖고 있어, 뜬 뒤에도 이걸
          남기면 **닫기 버튼이 두 개**가 된다(web 은 `onShowMessenger()` 로
          채널톡만 띄우므로 크롬이 하나다 — 그쪽에 맞춘다).

          ⚠️뜬 뒤의 탈출구는 채널톡 ✕ → `CHANNEL_TALK_VISIBILITY {isOpen:false}`
          브릿지다. **이미 이 시트가 닫히는 경로가 그것뿐**이므로(위 handleMessage)
          새로 생긴 의존이 아니다. 안드로이드는 `onRequestClose` 도 받는다.
          로딩 중에는 브릿지가 아직 없으니 그때만 네이티브 ✕ 를 남긴다 —
          20초 타임아웃 전에 유저가 빠져나갈 길이 필요하다.
        */}
        {!isReady ? (
          <View className="h-14 flex-row items-center justify-between border-b border-gray-100 px-5">
            <Text className="text-lg font-semibold text-gray-900">
              고객센터
            </Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <Close />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.body}>
          {visible ? (
            <WebView
              source={{uri: `${SERVICE_URL}/mypage`}}
              applicationNameForUserAgent={USER_AGENT}
              sharedCookiesEnabled
              setSupportMultipleWindows={false}
              webviewDebuggingEnabled={__DEV__}
              injectedJavaScriptBeforeContentLoaded={CHANNEL_TALK_ONLY_SCRIPT}
              injectedJavaScript={CHANNEL_TALK_ONLY_SCRIPT}
              onMessage={handleMessage}
              // 상담창이 뜨기 전엔 감춘다 — 아래 흰 커버와 짝이다.
              style={isReady ? styles.shown : styles.hidden}
            />
          ) : null}
          {!isReady ? (
            // 상담창이 뜨기 전엔 흰 화면 + 스피너로 덮는다. 안 덮으면 숨기기
            // 전의 web /mypage 가 한 프레임 스칠 수 있다.
            <View
              className="absolute inset-0 items-center justify-center bg-white"
              pointerEvents="none">
              <ActivityIndicator size="small" color="#667085" />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: {flex: 1},
  shown: {opacity: 1},
  hidden: {opacity: 0},
});
