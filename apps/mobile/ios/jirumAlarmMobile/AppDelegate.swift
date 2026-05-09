import Firebase
import Expo
import UIKit
import React
import React_RCTAppDelegate
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

@main
class AppDelegate: RCTAppDelegate {

  override func application(
        _ application: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
        // 네이버 로그인 핸들링
        if url.scheme == "jirumalarmnaver" {
            return NaverThirdPartyLoginConnection.getSharedInstance().application(application, open: url, options: options)
        }

        // 카카오 로그인 핸들링
        if url.scheme?.hasPrefix("kakao") == true && url.host == "oauth" {
            return AuthController.handleOpenUrl(url: url)
        }

        // 기본 React Native 딥링크 핸들링
        if RCTLinkingManager.application(application, open: url, options: options) {
            return true
        }

        return false
  }

  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    FirebaseApp.configure()

    // WKWebView 키보드 액세서리 바 전역 비활성화 (lazy var 트리거)
    _ = WKWebView.removeInputAccessoryView

    self.moduleName = "jirumAlarmMobile"
    self.dependencyProvider = RCTAppDependencyProvider()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func customize(_ rootView: RCTRootView!) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
