#!/usr/bin/env bash
# 기동 확인 — 이 커밋의 JS 를 Release 앱에 끼워 iOS 시뮬레이터에서 실제로 켜 본다(OTA 직전 관문).
#
#   scripts/boot-check.sh <Release-iphonesimulator/jirumAlarmMobile.app>
#
# 왜: 2026-10-01 CI 가 전부 초록인 OTA 가 실행 즉시 종료됐다. 테스트·타입은 "켜지나" 를 안 본다.
# 어떻게: 네이티브는 그대로 두고 main.jsbundle 만 이 커밋의 Hermes 바이트코드(OTA 와 같은 산출물)로 바꾼다.
#   그래서 Release .app 은 네이티브 지문이 같은 아무 빌드나 써도 된다(CI 는 지문으로 캐시).
#   expo-updates 는 꺼서 production OTA 가 내 번들을 덮지 못하게 한다.
# 판정: 콜드 스타트 3회(비로그인 2 · 로그인 경로 1) 모두 BOOT_WAIT 초 동안
#   ① 프로세스가 살아 있고(네이티브 크래시) ② 앱 로그에 치명 JS 예외가 없고 ③ JS 가 실제로 돌았으면 통과.
#   ②: 번들 로드 중 throw 는 프로세스를 안 죽이고 화면만 멈춘다(10/9 뮤테이션 실측 — 생존 판정만으론 통과했다).
#   ③: 앱 JS 는 시작하면 AsyncStorage 에 deviceId 를 쓴다 — 매번 지우고 다시 생기는지 본다.
#      없으면 JS 가 시작도 못 한 것(네이티브 멈춤)인데 ①② 는 이걸 통과시킨다.
# ponytail: JS 가 돈 뒤 오류 없이 멈추는 것·화면 깨짐은 못 잡는다 — 사고로 나오면 스크린샷 비교를 더한다.
set -euo pipefail

APP_SRC=${1:?사용법: boot-check.sh <Release .app>}
BUNDLE_ID=com.jirum-alarm.jirumalarm
WAIT=${BOOT_WAIT:-20}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=$(mktemp -d)
DEV=""
cleanup() {
  [ -n "$DEV" ] && xcrun simctl delete "$DEV" >/dev/null 2>&1
  rm -rf "$WORK"
}
trap cleanup EXIT

echo "▶ JS 번들(Hermes) 생성"
(cd "$ROOT" && npx expo export --platform ios --output-dir "$WORK/export" >/dev/null)
APP="$WORK/jirumAlarmMobile.app"
cp -R "$APP_SRC" "$APP"
cp "$WORK"/export/_expo/static/js/ios/*.hbc "$APP/main.jsbundle"
/usr/libexec/PlistBuddy -c 'Set :EXUpdatesEnabled false' "$APP/Expo.plist"
codesign --force --deep --sign - "$APP" 2>/dev/null

# 깨끗한 전용 기기 — 옛 OTA·권한 상태가 남은 기기는 판정을 흐린다(AGENTS.md §Mobile App).
# 기종·OS 는 이미 깔린 iPhone 중 최신 런타임 것을 따른다(devicetypes 목록은 런타임이 없는 옛 기종도 섞여 있다).
# ponytail: iOS 27 은 뺀다 — 새로 만든 iOS 27 기기는 원본 번들로도 스플래시에서 멈춘다(Firebase XPC 대기, 10/5·10/9 실측).
#   iOS 27 에서 실기기 문제가 보고되면 이 제외를 풀고 원인부터 본다. 강제로 고르려면 BOOT_RUNTIME=<런타임 id>.
read -r TYPE RUNTIME < <(xcrun simctl list devices available -j | BOOT_RUNTIME="${BOOT_RUNTIME:-}" python3 -c '
import json, os, sys
devs = json.load(sys.stdin)["devices"]
ver = lambda r: [int(x) for x in r.rsplit("iOS-", 1)[1].split("-")]
rt = os.environ["BOOT_RUNTIME"] or max((r for r, ds in devs.items() if "iOS" in r and ver(r)[0] < 27
         and any(d["name"].startswith("iPhone") for d in ds)), key=ver)
print(next(d["deviceTypeIdentifier"] for d in devs[rt] if d["name"].startswith("iPhone")), rt)')
DEV=$(xcrun simctl create boot-check "$TYPE" "$RUNTIME")
xcrun simctl boot "$DEV"
xcrun simctl bootstatus "$DEV" -b >/dev/null
xcrun simctl install "$DEV" "$APP"

STORE=""
launch() {
  local pid logpid log="$WORK/launch.log"
  rm -f "$STORE/manifest.json"
  [ -n "${2:-}" ] && printf '%s' "$2" >"$STORE/manifest.json"
  xcrun simctl spawn "$DEV" log stream --style compact --predicate 'process == "jirumAlarmMobile"' >"$log" 2>&1 &
  logpid=$!
  sleep 2
  pid=$(xcrun simctl launch "$DEV" "$BUNDLE_ID" | awk '{print $NF}')
  sleep "$WAIT"
  kill "$logpid" 2>/dev/null || true
  if ! ps -p "$pid" >/dev/null; then
    echo "✗ $1: ${WAIT}초 안에 종료됨(pid $pid)"
    /bin/ls -t ~/Library/Logs/DiagnosticReports 2>/dev/null | grep -m1 jirumAlarmMobile && echo "  크래시 리포트: ~/Library/Logs/DiagnosticReports"
    exit 1
  fi
  if grep -E 'Unhandled JS Exception|RCTFatal' "$log" >"$WORK/fatal.txt"; then
    echo "✗ $1: 치명 JS 예외"
    head -3 "$WORK/fatal.txt" | cut -c1-300
    exit 1
  fi
  if ! grep -q deviceId "$STORE/manifest.json" 2>/dev/null; then
    echo "✗ $1: JS 가 시작하지 못함(${WAIT}초 동안 AsyncStorage 기록 없음 — 네이티브에서 멈춤)"
    exit 1
  fi
  echo "✓ $1: ${WAIT}초 동안 생존·JS 실행·치명 예외 없음"
  xcrun simctl terminate "$DEV" "$BUNDLE_ID"
}

STORE="$(xcrun simctl get_app_container "$DEV" "$BUNDLE_ID" data)/Library/Application Support/$BUNDLE_ID/RCTAsyncLocalStorage_V1"
mkdir -p "$STORE"
launch "콜드 스타트 1(비로그인)"
launch "콜드 스타트 2(비로그인)"
# 토큰이 있으면 메인 진입·마운트까지 탄다(서버가 거절해 로그인으로 돌아오는 경로까지).
launch "콜드 스타트 3(로그인 경로)" '{"refreshToken":"\\"x\\""}'
echo "기동 확인 통과"
