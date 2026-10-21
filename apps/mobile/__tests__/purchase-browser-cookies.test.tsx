import * as ReactTestRenderer from 'react-test-renderer';
import type {ComponentProps} from 'react';
import type WebViewType from 'react-native-webview';
import PurchaseBrowserScreen from '../src/screens/purchase/PurchaseBrowserScreen';

// iOS 의 sharedCookiesEnabled 는 웹뷰 쿠키가 하나 바뀔 때마다 저장소의 쿠키 **전부**를 메인 스레드에서
// 앱 쿠키 저장소로 다시 쓴다. 쇼핑몰은 쿠키를 수십 개씩 계속 굽고, 기본(영구) 저장소엔 지난 쇼핑몰
// 쿠키까지 쌓여 구매 웹뷰가 몇 초씩 멈췄다(App Hanging — 스택이 cookiesDidChangeInCookieStore).
// 구매 웹뷰는 외부 쇼핑몰만 열어 앱 쿠키(우리 도메인 로그인)가 필요 없다. 쇼핑몰 로그인은 웹뷰
// 기본 저장소가 이 옵션 없이도 남긴다.

type WebViewProps = ComponentProps<typeof WebViewType>;
const rendered: {props: WebViewProps | null} = {props: null};

jest.mock('react-native-webview', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const MockWebView = ReactActual.forwardRef((props: WebViewProps, _ref) => {
    rendered.props = props;
    return null;
  });
  return {__esModule: true, default: MockWebView};
});

// universal-link 이 expo 를 import 한다 — 진짜를 끌어오면 expo-modules-core ESM 으로 깨진다.
jest.mock('expo', () => ({requireOptionalNativeModule: () => null}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => {},
}));

jest.mock('@/shared/lib/analytics/ga4', () => ({
  Analytics: {track: jest.fn()},
}));

test('구매 웹뷰는 앱 쿠키 공유(sharedCookiesEnabled)를 켜지 않는다', async () => {
  const props = {
    route: {
      key: 'PurchaseBrowser',
      name: 'PurchaseBrowser',
      params: {url: 'https://example.com/item', title: '쇼핑몰', productId: 1},
    },
    navigation: {
      goBack: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => () => {}),
    },
  } as unknown as ComponentProps<typeof PurchaseBrowserScreen>;

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<PurchaseBrowserScreen {...props} />);
  });

  expect(rendered.props).not.toBeNull();
  expect(rendered.props?.sharedCookiesEnabled).toBeFalsy();

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
