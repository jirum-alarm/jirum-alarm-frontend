#!/usr/bin/env bash
# 기동 확인 — 이 커밋의 JS 를 Release 앱에 끼워 iOS 시뮬레이터에서 실제로 켜 본다(OTA 직전 관문).
#
#   scripts/boot-check.sh <Release-iphonesimulator/jirumAlarmMobile.app>
#
# 왜: 2026-10-01 CI 가 전부 초록인 OTA 가 실행 즉시 종료됐다. 테스트·타입은 "켜지나" 를 안 본다.
# 어떻게: 네이티브는 그대로 두고 main.jsbundle 만 이 커밋의 Hermes 바이트코드(OTA 와 같은 산출물)로 바꾼다.
#   그래서 Release .app 은 네이티브 지문이 같은 아무 빌드나 써도 된다(CI 는 지문으로 캐시).
#   expo-updates 는 꺼서 production OTA 가 내 번들을 덮지 못하게 한다.
# 판정: 콜드 스타트 3회(비로그인 2 · 로그인 경로 1) 모두 BOOT_WAIT 초 뒤에도 프로세스가 살아 있으면 통과.
# ponytail: "살아 있나" 만 본다 — 실행 즉시 종료(JS 치명 오류·네이티브 크래시)는 잡고, 스플래시 멈춤·화면 깨짐은 못 잡는다.
#   그쪽이 사고로 나오면 스크린샷 비교를 더한다.
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
TYPE=$(xcrun simctl list devicetypes -j | python3 -c 'import json,sys; print([d["identifier"] for d in json.load(sys.stdin)["devicetypes"] if d["name"].startswith("iPhone")][-1])')
DEV=$(xcrun simctl create boot-check "$TYPE")
xcrun simctl boot "$DEV"
xcrun simctl bootstatus "$DEV" -b >/dev/null
xcrun simctl install "$DEV" "$APP"

launch() {
  local pid
  pid=$(xcrun simctl launch "$DEV" "$BUNDLE_ID" | awk '{print $NF}')
  sleep "$WAIT"
  if ! ps -p "$pid" >/dev/null; then
    echo "✗ $1: ${WAIT}초 안에 종료됨(pid $pid)"
    /bin/ls -t ~/Library/Logs/DiagnosticReports 2>/dev/null | grep -m1 jirumAlarmMobile && echo "  크래시 리포트: ~/Library/Logs/DiagnosticReports"
    exit 1
  fi
  echo "✓ $1: ${WAIT}초 뒤 살아 있음"
  xcrun simctl terminate "$DEV" "$BUNDLE_ID"
}

launch "콜드 스타트 1(비로그인)"
launch "콜드 스타트 2(비로그인)"
# 토큰이 있으면 메인 진입·마운트까지 탄다(서버가 거절해 로그인으로 돌아오는 경로까지).
STORE="$(xcrun simctl get_app_container "$DEV" "$BUNDLE_ID" data)/Library/Application Support/$BUNDLE_ID/RCTAsyncLocalStorage_V1"
mkdir -p "$STORE"
printf '{"refreshToken":"\\"x\\""}' >"$STORE/manifest.json"
launch "콜드 스타트 3(로그인 경로)"
echo "기동 확인 통과"
