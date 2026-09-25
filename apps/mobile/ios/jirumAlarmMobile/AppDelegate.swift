import Firebase
import Expo
import UIKit
import React
import ReactAppDependencyProvider
import RNBootSplash
import NaverThirdPartyLogin
import KakaoSDKAuth
import WebKit
import ObjectiveC

// 모든 WKWebView의 키보드 액세서리 뷰(▲▼ Done 바)를 숨김.
// react-native-webview의 hideKeyboardAccessoryView는 메인 webview에는 적용되나
// 채널톡 등 iframe 내 input에는 영향이 적어 전역 swizzle로 처리.
extension WKWebView {
  static let removeInputAccessoryView: Void = {
    let original = class_getInstanceMethod(WKWebView.self, #selector(getter: UIResponder.inputAccessoryView))
    let block: @convention(block) (Any) -> UIView? = { _ in nil }
    let imp = imp_implementationWithBlock(block)
    if let original = original {
      method_setImplementation(original, imp)
    }
  }()
}

// ★Expo SDK 54 표준 AppDelegate(ExpoAppDelegate + ExpoReactNativeFactory).
//
// 예전엔 RCTAppDelegate 를 상속해서 Expo 의 react delegate handler·AppDelegate subscriber 가
// 하나도 돌지 않았다. 그 결과 expo-updates 는 initializeWithoutStarting() 만 되고 start() 가
// 불리지 않아, JS 가 Updates 상수를 읽는 순간 startupProcedure(IUO) nil 로 SIGTRAP —
// Release 에서 실행 즉시 크래시(App Store 심사 2.1(a) 거절, 1.4.3 build 27). 번들도 늘
// 내장 main.jsbundle 이라 iOS OTA 가 한 번도 적용된 적 없었다.
// 표준 구조로 두면 ExpoUpdatesReactDelegateHandler 가 start()·번들 URL·루트뷰 교체를 전부 한다.
@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    // WKWebView 키보드 액세서리 바 전역 비활성화 (lazy var 트리거)
    _ = WKWebView.removeInputAccessoryView

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "jirumAlarmMobile",
      in: window,
      launchOptions: launchOptions
    )

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // 네이버 로그인 핸들링
    if url.scheme == "jirumalarmnaver" {
      return NaverThirdPartyLoginConnection.getSharedInstance().application(app, open: url, options: options)
    }

    // 카카오 로그인 핸들링
    if url.scheme?.hasPrefix("kakao") == true && url.host == "oauth" {
      return AuthController.handleOpenUrl(url: url)
    }

    // Expo subscriber → React Native 딥링크
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func customize(_ rootView: UIView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // expo-dev-client 가 올바른 URL 을 받으려면 필요하다.
    bridge.bundleURL ?? bundleURL()
  }

  // Release 에선 expo-updates 가 이 값을 launchAssetUrl() 로 덮는다(OTA 번들).
  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
