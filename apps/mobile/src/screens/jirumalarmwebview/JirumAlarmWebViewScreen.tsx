import WebView from 'react-native-webview';
import {handleWebViewMessage} from '@/shared/lib/webview';
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

import {SERVICE_URL} from '@/constants/env';

import {SystemBars} from 'react-native-edge-to-edge';
import {useCommonWebViewLogic} from './hooks/useCommonWebViewLogic';
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
  } = useCommonWebViewLogic();

  const {refreshing, enableRefresh, setEnableRefresh, onRefresh} =
    useAndroidRefreshLogic(webviewRef);

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
          applicationNameForUserAgent={userAgentSuffix}
          setSupportMultipleWindows={false}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleLoadEnd}
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
      <SafeAreaView style={[styles.safeAreaBottom, {height: insets.bottom}]} />
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
  } = useCommonWebViewLogic();

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
        applicationNameForUserAgent={userAgentSuffix}
        setSupportMultipleWindows={false}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={handleLoadEnd}
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
      <SafeAreaView style={[styles.safeAreaBottom, {height: insets.bottom}]} />
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
