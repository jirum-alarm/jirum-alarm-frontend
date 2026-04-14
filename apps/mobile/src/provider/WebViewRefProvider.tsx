import {
  createContext,
  type RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import type WebView from 'react-native-webview';
import {tabNavigations} from '@/shared/constant/navigations';
import {getTabNameFromUrl} from '@/shared/lib/navigation/tab-routing';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

export type WebviewRefContextType = {
  /** 기존 호환용: 현재 활성 탭의 WebView ref */
  webviewRef: RefObject<WebView | null>;
  /** 탭별 WebView ref 등록 */
  registerWebViewRef: (
    tabName: TabName,
    ref: RefObject<WebView | null>,
  ) => void;
  /** 탭별 WebView ref 해제 */
  unregisterWebViewRef: (tabName: TabName) => void;
  /** 특정 탭의 WebView ref 가져오기 */
  getWebViewRef: (tabName: TabName) => RefObject<WebView | null> | undefined;
  /** URL 기반으로 적절한 WebView ref 가져오기 */
  getWebViewRefByUrl: (url: string) => RefObject<WebView | null> | undefined;
  /** 현재 활성 탭 설정 */
  setActiveTab: (tabName: TabName) => void;
  /** 현재 활성 탭 이름 */
  activeTabRef: RefObject<TabName>;
};

export const WebviewRefContext = createContext<WebviewRefContextType | null>(
  null,
);

export const useWebviewContext = () => {
  const context = useContext(WebviewRefContext);
  if (context === null) {
    throw new Error(
      'useWebviewContext must be used within a WebviewRefContext',
    );
  }
  return context;
};

export function useWebViewRefManager() {
  const webViewRefs = useRef<Map<TabName, RefObject<WebView | null>>>(
    new Map(),
  );
  const activeTabRef = useRef<TabName>(tabNavigations.HOME);

  // 읽을 때마다 현재 활성 탭의 WebView를 동적으로 조회하는 프록시 ref
  const activeWebViewRef = useMemo<RefObject<WebView | null>>(
    () => ({
      get current() {
        const currentTabRef = webViewRefs.current.get(activeTabRef.current);
        return currentTabRef?.current ?? null;
      },
      set current(_value) {
        // no-op: 실제 값은 각 탭의 ref가 관리
      },
    }),
    [],
  );

  const registerWebViewRef = useCallback(
    (tabName: TabName, ref: RefObject<WebView | null>) => {
      webViewRefs.current.set(tabName, ref);
    },
    [],
  );

  const unregisterWebViewRef = useCallback((tabName: TabName) => {
    webViewRefs.current.delete(tabName);
  }, []);

  const getWebViewRef = useCallback(
    (tabName: TabName) => webViewRefs.current.get(tabName),
    [],
  );

  const getWebViewRefByUrl = useCallback((url: string) => {
    const tabName = getTabNameFromUrl(url);
    return webViewRefs.current.get(tabName);
  }, []);

  const setActiveTab = useCallback((tabName: TabName) => {
    activeTabRef.current = tabName;
  }, []);

  return {
    webviewRef: activeWebViewRef,
    registerWebViewRef,
    unregisterWebViewRef,
    getWebViewRef,
    getWebViewRefByUrl,
    setActiveTab,
    activeTabRef,
  };
}
