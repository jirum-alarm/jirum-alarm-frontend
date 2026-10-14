import ExpoModulesCore
import UIKit

/// 쇼핑몰 앱을 Universal Link 로만 연다.
///
/// 지마켓·옥션은 iOS 에서 앱 스킴 대신 `https://appgate.gmarket.com/universal?app=gmkt|iac` 로만 앱을 부른다.
/// WKWebView 안의 이동은 Universal Link 를 열지 않고, `Linking.openURL` 은 앱이 없으면 사파리로 내보낸다.
/// `.universalLinksOnly` 는 앱이 깔려 있을 때만 열고 아니면 false — 그때는 구매 웹뷰가 그 주소를 웹으로 이어 띄운다.
public class UniversalLinkModule: Module {
  public func definition() -> ModuleDefinition {
    Name("UniversalLink")

    AsyncFunction("openAsync") { (urlString: String, promise: Promise) in
      guard let url = URL(string: urlString) else {
        promise.resolve(false)
        return
      }
      UIApplication.shared.open(url, options: [.universalLinksOnly: true]) { opened in
        promise.resolve(opened)
      }
    }.runOnQueue(.main)
  }
}
