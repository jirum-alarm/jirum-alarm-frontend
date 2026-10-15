// 카톡 오픈채팅방 인원 읽기 — 방 창 머리 「대화상대 N명」 버튼 이름을 접근성 API 로 직접 읽는다.
// System Events 를 거치지 않아 발송봇(System Events 로 카톡 창을 연다)과 부딪히지 않고, 포커스·클릭도 없다.
// 접근성 권한이 없으면 기다리지 않고 바로 끝난다(cron osascript 처럼 권한 대기로 멈추지 않는다 — 2026-10-12 사고).
// 빌드(맥 스튜디오): swiftc -O axcount.swift -o axcount · 사용: axcount <방 이름>... → 줄마다 「방이름<TAB>숫자|NA」
import AppKit
import ApplicationServices

func attr(_ e: AXUIElement, _ a: String) -> AnyObject? {
  var v: AnyObject?
  return AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success ? v : nil
}
let rooms = Array(CommandLine.arguments.dropFirst())
func fail(_ why: String) -> Never {
  for r in rooms { print("\(r)\tNA") }
  FileHandle.standardError.write((why + "\n").data(using: .utf8)!)
  exit(1)
}
guard AXIsProcessTrusted() else { fail("접근성 권한 없음") }
guard let app = NSRunningApplication.runningApplications(withBundleIdentifier: "com.kakao.KakaoTalkMac").first else { fail("카톡 안 떠 있음") }
let ax = AXUIElementCreateApplication(app.processIdentifier)
AXUIElementSetMessagingTimeout(ax, 2.0)
let wins = (attr(ax, kAXWindowsAttribute) as? [AXUIElement]) ?? []
for room in rooms {
  var n = "NA"
  if let w = wins.first(where: { (attr($0, kAXTitleAttribute) as? String) == room }) {
    for k in (attr(w, kAXChildrenAttribute) as? [AXUIElement]) ?? [] where (attr(k, kAXRoleAttribute) as? String) == "AXButton" {
      let name = (attr(k, kAXTitleAttribute) as? String) ?? (attr(k, kAXDescriptionAttribute) as? String) ?? ""
      if name.hasPrefix("대화상대") { n = name.filter(\.isNumber); break }
    }
  }
  print("\(room)\t\(n.isEmpty ? "NA" : n)")
}
