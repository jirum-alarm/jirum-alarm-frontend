import Firebase
internal import Expo
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

// ★Expo 표준 AppDelegate(ExpoAppDelegate + ExpoReactNativeFactory). SDK 57 부터 bindReactNativeFactory 가
// 없어졌다 — ExpoReactNativeFactory 가 만들어질 때 react delegate handler(expo-updates 등)에 스스로 묶인다.
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
  /// 창과 RN 은 SceneDelegate 가 시작한다(아래 설명) — 그때 넘기려고 보관한다.
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

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
    self.launchOptions = launchOptions

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

// ★UIScene 생명주기 — iOS 27 SDK(Xcode 27)부터 필수다. 씬을 안 쓰면
// "UIScene life cycle is required for apps built with this SDK" 로 실행 즉시 종료된다
// (Xcode 27 Release 빌드를 iOS 27 시뮬레이터에서 실측, 2026-09-27). Expo SDK 54 의
// ExpoAppDelegate 엔 씬 지원이 없어 직접 뒀다(Info.plist UIApplicationSceneManifest 가 이 클래스를 가리킨다).
// SDK 57 엔 ExpoAppSceneDelegate 가 생겼지만 SDK 57 템플릿도 씬을 쓰지 않고, 아래 분기(카카오·네이버 콜백)는
// 테스트(ios-native-config)로 묶여 있어 그대로 둔다. 앱 생명주기를 듣는 Expo subscriber 는 57 에서도 0개(2026-10-09 확인).
//
// 씬 방식에선 두 가지가 AppDelegate 가 아니라 여기로 온다 — 둘 다 AppDelegate 의 기존 분기로 넘긴다:
//  1) URL(카카오·네이버 OAuth 콜백, jirumalarm:// 딥링크)과 유니버설 링크
//  2) 콜드 스타트 URL — launchOptions 가 아니라 connectionOptions 에 담겨 온다.
//     RN Linking.getInitialURL 은 launchOptions 의 url / userActivityDictionary 를 읽으므로 옮겨 담고,
//     예전처럼 open/continue 도 한 번 불러 준다(씬 전엔 iOS 가 didFinishLaunching 뒤에 그걸 불렀다).
// 앱 활성/백그라운드 콜백은 넘기지 않는다 — 그걸 쓰는 Expo subscriber 가 없고(2026-09-27 확인),
// RN AppState 는 UIApplication 알림을 보는데 그 알림은 씬 방식에서도 온다.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate? { UIApplication.shared.delegate as? AppDelegate }

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = appDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window

    var launchOptions = appDelegate.launchOptions ?? [:]
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions[.url] = url
    }
    let webActivity = connectionOptions.userActivities.first {
      $0.activityType == NSUserActivityTypeBrowsingWeb
    }
    if let activity = webActivity {
      launchOptions[.userActivityDictionary] = [
        UIApplication.LaunchOptionsKey.userActivityType.rawValue: activity.activityType,
        "UIApplicationLaunchOptionsUserActivityKey": activity,
      ]
    }

    factory.startReactNative(
      withModuleName: "jirumAlarmMobile",
      in: window,
      launchOptions: launchOptions
    )

    if !connectionOptions.urlContexts.isEmpty {
      self.scene(scene, openURLContexts: connectionOptions.urlContexts)
    }
    if let activity = webActivity {
      self.scene(scene, continue: activity)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let context = URLContexts.first else { return }
    var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    options[.sourceApplication] = context.options.sourceApplication
    options[.annotation] = context.options.annotation
    options[.openInPlace] = context.options.openInPlace
    _ = appDelegate?.application(UIApplication.shared, open: context.url, options: options)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = appDelegate?.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
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
