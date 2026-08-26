import WebView from 'react-native-webview';
import {handleWebViewMessage, NATIVE_STACK_SCRIPT} from '@/shared/lib/webview';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  Animated,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {SERVICE_URL} from '@/constants/env';

import {SystemBars} from 'react-native-edge-to-edge';
import {useCommonWebViewLogic} from './hooks/useCommonWebViewLogic';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {MainParamList} from '@/navigations/stack/MainNavigator';
import {mainNavigations} from '@/shared/constant/navigations';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type JirumAlarmWebViewScreenRouteProp = NativeStackScreenProps<
  MainParamList,
  typeof mainNavigations.JIRUM_ALARM_WEBVIEW
>;

// 공통 userAgent
const userAgentSuffix =
  Platform.OS === 'ios'
    ? 'IOS ReactNative Webview Jirum Alarm'
    : 'Android ReactNative Webview Jirum Alarm';

// 공통 로직 훅

// 안드로이드 리프레시 훅
/**
 * 이 웹뷰가 비워야 할 하단 높이.
 *
 * ★iOS 26 에서 탭바를 숨기면 내비게이터가 `marginBottom: -clipPx` 로 화면을
 * **위로 당긴다**. 화면이 그만큼 되밀지 않으면 웹 콘텐츠 아래가 잘려
 * 홈 인디케이터에 붙는다 — 폴백 상세 웹뷰에서 같은 버그를 이미 고쳤다(b6fac36f).
 *
 * 웹 콘텐츠는 자체 safe area 처리가 없어서(네이티브 화면과 다르다) 여기서
 * 반드시 줘야 한다. clip 이 없는 환경(안드로이드·iOS 25 이하)은 insets 만.
 */
function useWebViewBottomInset() {
  const clipPad = useHiddenTabBarClipPadding();
  const insets = useSafeAreaInsets();
  return clipPad > 0 ? clipPad : insets.bottom;
}

function useAndroidRefreshLogic(webviewRef: React.RefObject<WebView | null>) {
  const [refreshing, setRefreshing] = useState(false);
  const [enableRefresh, setEnableRefresh] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webviewRef.current?.reload();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [webviewRef]);

  return {
    refreshing,
    setRefreshing,
    enableRefresh,
    setEnableRefresh,
    onRefresh,
  };
}

// Android 전용 컴포넌트
const JirumAlarmWebViewAndroid = ({
  route,
}: JirumAlarmWebViewScreenRouteProp) => {
  const {uri} = route.params ?? {uri: ''};
  const {
    insets,
    webviewRef,
    navState,
    setNavState,
    bgAnimation,
    isScroll,
    setIsScroll,
    handleShouldStartLoadWithRequest,
    shouldDarkStatusBar,
    isLoading,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    hasError,
    handleError,
    retry,
  } = useCommonWebViewLogic();

  const {refreshing, enableRefresh, setEnableRefresh, onRefresh} =
    useAndroidRefreshLogic(webviewRef);
  const bottomInset = useWebViewBottomInset();

  return (
    <View style={styles.container}>
      <SystemBars
        style={shouldDarkStatusBar ? 'light' : 'dark'}
        hidden={false}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          height: insets.top,
          backgroundColor: bgAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#101828', '#ffffff'],
          }),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            enabled={enableRefresh}
            onRefresh={onRefresh}
          />
        }>
        <WebView
          ref={webviewRef}
          sharedCookiesEnabled={true}
          pullToRefreshEnabled
          decelerationRate={0.998}
          source={{uri: `${SERVICE_URL}${uri}`}}
          // ★탭 스택 위 웹뷰라고 웹에 알린다. 없으면 웹 뒤로가기가
          // router.push('/') 로 떨어져 이 웹뷰 안에 홈이 그려진다.
          //
          // ★★두 prop 모두 필요하다 — web `useGoBack` 이 클릭 시점에
          // `dataset.nativeStack` 을 읽으므로 **하이드레이션 전에** 값이 있어야
          // 한다. `injectedJavaScript`(문서 로드 후)만 주면 첫 클릭이 이미
          // router.push('/') 로 새어 홈으로 튄다(상세 폴백 웹뷰도 둘 다 준다).
          injectedJavaScriptBeforeContentLoaded={NATIVE_STACK_SCRIPT}
          injectedJavaScript={NATIVE_STACK_SCRIPT}
          applicationNameForUserAgent={userAgentSuffix}
          setSupportMultipleWindows={false}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
          onHttpError={handleLoadEnd}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onContentProcessDidTerminate={() => {
            webviewRef.current?.reload();
          }}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={state =>
            setNavState({url: state.url, canGoBack: state.canGoBack})
          }
          // allowsBackForwardNavigationGestures={true}
          onScroll={e => {
            const scrollY = e.nativeEvent.contentOffset.y;

            if (scrollY === 0) {
              setEnableRefresh(true);
            } else {
              setEnableRefresh(false);
            }

            if (navState.url === `${SERVICE_URL}/`) {
              if (scrollY > 100 && !isScroll) {
                setIsScroll(true);
              } else if (scrollY < 100 && isScroll) {
                setIsScroll(false);
              }
            }
          }}
        />
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator size="large" color="#101828" />
        </View>
      )}
      {hasError && <WebViewErrorView onRetry={retry} />}
      <SafeAreaView style={[styles.safeAreaBottom, {height: bottomInset}]} />
    </View>
  );
};

// iOS 전용 컴포넌트
const JirumAlarmWebViewIOS = ({route}: JirumAlarmWebViewScreenRouteProp) => {
  const {uri} = route.params ?? {uri: ''};

  const {
    insets,
    webviewRef,
    navState,
    setNavState,
    bgAnimation,
    handleNavigationStateChange,
    isScroll,
    setIsScroll,
    handleShouldStartLoadWithRequest,
    shouldDarkStatusBar,
    isLoading,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    hasError,
    handleError,
    retry,
  } = useCommonWebViewLogic();
  const bottomInset = useWebViewBottomInset();

  return (
    <View style={styles.container}>
      <SystemBars
        style={shouldDarkStatusBar ? 'light' : 'dark'}
        hidden={false}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          height: insets.top,
          backgroundColor: bgAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#101828', '#ffffff'],
          }),
        }}
      />
      <WebView
        ref={webviewRef}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}
        decelerationRate={1.0}
        source={{uri: `${SERVICE_URL}${uri}`}}
        // ★위 Android 쪽과 같은 이유 — 웹 뒤로가기를 네이티브 pop 으로 돌린다.
        // 두 prop 모두 주는 이유도 위와 같다(하이드레이션 전 값이 있어야 한다).
        injectedJavaScriptBeforeContentLoaded={NATIVE_STACK_SCRIPT}
        injectedJavaScript={NATIVE_STACK_SCRIPT}
        applicationNameForUserAgent={userAgentSuffix}
        setSupportMultipleWindows={false}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={handleError}
        onHttpError={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onContentProcessDidTerminate={() => {
          webviewRef.current?.reload();
        }}
        onMessage={event => {
          handleWebViewMessage(event);
          handleNavigationStateChange(event);
        }}
        onNavigationStateChange={state =>
          setNavState({url: state.url, canGoBack: state.canGoBack})
        }
        allowsBackForwardNavigationGestures={true}
        onScroll={e => {
          const scrollY = e.nativeEvent.contentOffset.y;

          if (navState.url === `${SERVICE_URL}/`) {
            if (scrollY > 100 && !isScroll) {
              setIsScroll(true);
            } else if (scrollY < 100 && isScroll) {
              setIsScroll(false);
            }
          }
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator size="large" color="#101828" />
        </View>
      )}
      {hasError && <WebViewErrorView onRetry={retry} />}
      <SafeAreaView style={[styles.safeAreaBottom, {height: bottomInset}]} />
    </View>
  );
};

// platform.select로 분기
const JirumAlarmWebViewScreen = Platform.select({
  android: JirumAlarmWebViewAndroid,
  ios: JirumAlarmWebViewIOS,
  default: JirumAlarmWebViewIOS,
});

export default JirumAlarmWebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
  },
  safeAreaBottom: {
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
