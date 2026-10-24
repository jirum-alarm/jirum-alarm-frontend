#!/usr/bin/env bash
# 앱 화면 하네스 — 이 커밋의 JS 를 Release 앱에 끼워 iOS 시뮬레이터에서 주요 화면을 딥링크로 열고 라이트·다크로 찍는다.
#
#   scripts/screens-ios.sh <Release-iphonesimulator/jirumAlarmMobile.app>
#   → screens-out/<light|dark>/<화면>.png + screens-out/report.md  (AI 는 report.md → png 순으로 본다)
#
# 왜: boot-check 는 «켜지나»만 본다. 화면이 비었는지·다크에서 흰 판이 남았는지는 찍어 봐야 안다(web 의 apps/web/screens 와 같은 목적).
# 데이터: SCREENS_API=fixture 면 web 하네스의 고정 데이터 서버(apps/web/screens/fixture-server.mts)에 붙인다 — 녹화는
#   apps/mobile/screens-fixtures/(web 녹화와 따로), 앱은 저장소 키 jirum:screens-api-url 로 그 주소를 쓴다(shared/lib/client/screens-api.ts,
#   localhost 만 받음). 첫 실행 게스트도 로그인 데이터(user-fixtures.ts)로 답한다. 화면이 실행마다 같고 운영 점검·장애와 무관하다.
#   SCREENS_MODE=record 면 운영에서 새로 녹화한다(새 화면·새 쿼리를 쓸 때). 그 밖(기본)은 운영 API 를 그대로 읽는다.
# 판정(❌ = 실패): 프로세스 종료 · 치명 JS 예외(boot-check 와 같은 로그 패턴) · 화면이 거의 한 색(빈 화면·흰 화면).
# 보고(⚠️): 다크인데 밝은 면이 화면 대부분 · 라이트와 다크가 거의 같은 그림(다크 미적용).
# 준비는 boot-check.sh 와 같다(번들만 갈아 끼우기·업데이트 끔·분석 끔·깨끗한 전용 기기·iOS 27 제외) — 바꾸면 둘 다.
# SCREENS_SKIP_EXPORT=1 이면 .app 의 번들을 그대로 쓴다(이미 이 커밋 번들을 넣은 .app 일 때).
set -euo pipefail

APP_SRC=${1:?사용법: screens-ios.sh <Release .app>}
BUNDLE_ID=com.jirum-alarm.jirumalarm
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${SCREENS_OUT:-$ROOT/screens-out}
WAIT=${SCREENS_WAIT:-12}
WORK=$(mktemp -d)
DEV=""
LOGPID=""
FIXPID=""
cleanup() {
  [ -n "$LOGPID" ] && kill "$LOGPID" 2>/dev/null
  [ -n "$FIXPID" ] && kill "$FIXPID" 2>/dev/null
  [ -n "$DEV" ] && xcrun simctl delete "$DEV" >/dev/null 2>&1
  rm -rf "$WORK"
}
trap cleanup EXIT

# 화면 이름 → 딥링크(커스텀 스킴). home 은 실행 직후 첫 화면.
# 새 네이티브 화면을 만들거나 자주 깨지는 화면이 생기면 여기 한 줄.
SCREENS=(
  "product-detail jirumalarm://products/36089133"
  "search jirumalarm://search?keyword=%EC%84%B8%EC%A0%9C"
  "keywords jirumalarm://keywords"
  "keyword-hub jirumalarm://keywords/%EC%84%B8%EC%A0%9C"
  "ranking jirumalarm://trending/ranking"
  "hot-feed jirumalarm://trending/hot"
  "alarm jirumalarm://alarm"
  "mypage jirumalarm://mypage"
  "design-system jirumalarm://design-system"
)

APP="$WORK/jirumAlarmMobile.app"
cp -R "$APP_SRC" "$APP"
if [ "${SCREENS_SKIP_EXPORT:-}" != 1 ]; then
  echo "▶ JS 번들(Hermes) 생성"
  (cd "$ROOT" && npx expo export --platform ios --output-dir "$WORK/export" >/dev/null)
  cp "$WORK"/export/_expo/static/js/ios/*.hbc "$APP/main.jsbundle"
fi
/usr/libexec/PlistBuddy -c 'Set :EXUpdatesEnabled false' "$APP/Expo.plist"
/usr/libexec/PlistBuddy -c 'Delete :FIREBASE_ANALYTICS_COLLECTION_ENABLED' "$APP/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c 'Add :FIREBASE_ANALYTICS_COLLECTION_ENABLED bool false' "$APP/Info.plist"
codesign --force --deep --sign - "$APP" 2>/dev/null

read -r TYPE RUNTIME < <(xcrun simctl list devices available -j | BOOT_RUNTIME="${BOOT_RUNTIME:-}" python3 -c '
import json, os, sys
devs = json.load(sys.stdin)["devices"]
ver = lambda r: [int(x) for x in r.rsplit("iOS-", 1)[1].split("-")]
rt = os.environ["BOOT_RUNTIME"] or max((r for r, ds in devs.items() if "iOS" in r and ver(r)[0] < 27
         and any(d["name"].startswith("iPhone") for d in ds)), key=ver)
print(next(d["deviceTypeIdentifier"] for d in devs[rt] if d["name"].startswith("iPhone")), rt)')
DEV=$(xcrun simctl create app-screens "$TYPE" "$RUNTIME")
xcrun simctl boot "$DEV"
xcrun simctl bootstatus "$DEV" -b >/dev/null
xcrun simctl install "$DEV" "$APP"

rm -rf "$OUT"
mkdir -p "$OUT/light" "$OUT/dark"

API_URL=""
if [ "${SCREENS_API:-}" = fixture ]; then
  PORT=${SCREENS_FIXTURE_PORT:-9190}
  REPO=$(cd "$ROOT/../.." && pwd)
  echo "▶ 고정 데이터 서버(:$PORT, ${SCREENS_MODE:-replay})"
  SCREENS_FIXTURES_DIR="$ROOT/screens-fixtures" SCREENS_GUEST_AS_USER=1 SCREENS_MODE="${SCREENS_MODE:-replay}" \
    SCREENS_FIXTURE_PORT="$PORT" node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
    "$REPO/apps/web/screens/fixture-server.mts" >"$WORK/fixture.log" 2>&1 &
  FIXPID=$!
  for _ in $(seq 1 30); do curl -sf "http://localhost:$PORT/__missing" >/dev/null && break; sleep 1; done
  curl -sf "http://localhost:$PORT/__missing" >/dev/null || { echo "✗ 고정 데이터 서버가 안 뜸"; cat "$WORK/fixture.log"; exit 1; }
  API_URL="http://localhost:$PORT/graphql"
fi
LOG="$WORK/app.log"
xcrun simctl spawn "$DEV" log stream --style compact --predicate 'process == "jirumAlarmMobile"' >"$LOG" 2>&1 &
LOGPID=$!

FAILED=0
STORE="$(xcrun simctl get_app_container "$DEV" "$BUNDLE_ID" data)/Library/Application Support/$BUNDLE_ID/RCTAsyncLocalStorage_V1"
mkdir -p "$STORE"

# 화면 하나 = 콜드 스타트 하나. `simctl openurl` 은 매번 «열겠습니까?» 확인 창이 떠서(눌러 줄 길이 없다) 화면이 안 바뀐다 —
# 대신 앱 저장소(AsyncStorage manifest)에 열 주소를 넣고 켜면 앱이 딥링크와 같은 길로 연다(useDeepLink takeScreensHarnessUrl).
# 저장소의 다른 값(deviceId 등)은 그대로 둔다 — 지우면 켤 때마다 새 기기·새 게스트가 생긴다.
capture() { # <theme> <name> [url]
  local pid
  xcrun simctl terminate "$DEV" "$BUNDLE_ID" >/dev/null 2>&1 || true
  HARNESS_URL="${3:-}" API_URL="$API_URL" python3 -c '
import json, os, sys
path = os.path.join(sys.argv[1], "manifest.json")
data = json.load(open(path)) if os.path.exists(path) else {}
data.pop("jirum:screens-harness-url", None)
if os.environ["HARNESS_URL"]:
    data["jirum:screens-harness-url"] = os.environ["HARNESS_URL"]
if os.environ["API_URL"]:
    data["jirum:screens-api-url"] = os.environ["API_URL"]
    # 고정 데이터의 로그인 사용자는 키워드가 있어 알림 권한 안내 시트가 모든 화면 아래 절반을 덮는다 — 이미 본 것으로.
    data["pushPrePromptShown"] = "true"
json.dump(data, open(path, "w"))' "$STORE"
  pid=$(xcrun simctl launch "$DEV" "$BUNDLE_ID" | awk '{print $NF}')
  sleep "$WAIT"
  xcrun simctl io "$DEV" screenshot "$OUT/$1/$2.png" >/dev/null 2>&1 || true
  if ps -p "$pid" >/dev/null 2>&1; then
    echo "  찍음 $1/$2"
  else
    echo "✗ $1/$2: 앱이 종료됨"
    rm -f "$OUT/$1/$2.png"
    FAILED=1
  fi
}

for THEME in light dark; do
  echo "▶ $THEME"
  xcrun simctl ui "$DEV" appearance "$THEME"
  # 설치 뒤 첫 실행은 첫 안내 시트가 덮는다 — 그 자체도 화면이라 따로 찍고, 나머지는 두 번째 실행부터.
  [ "$THEME" = light ] && capture "$THEME" first-launch
  capture "$THEME" home
  for entry in "${SCREENS[@]}"; do
    capture "$THEME" "${entry%% *}" "${entry#* }"
  done
done

kill "$LOGPID" 2>/dev/null || true
LOGPID=""
if grep -E 'Unhandled JS Exception|RCTFatal' "$LOG" >"$WORK/fatal.txt"; then
  echo "✗ 치명 JS 예외"
  head -3 "$WORK/fatal.txt" | cut -c1-300
  FAILED=1
fi

# 그림 판정 — PIL 없이(macOS 러너 기본 python) sips 로 64px BMP 로 줄여 픽셀을 센다. 상태 표시줄(위 8%)은 뺀다.
for f in "$OUT"/*/*.png; do
  sips -s format bmp --resampleWidth 64 "$f" --out "${f%.png}.bmp" >/dev/null 2>&1
done
FATAL_LOG="$WORK/fatal.txt" SCREENS_TITLE="앱 화면 하네스 결과 (iOS)" python3 "$(dirname "$0")/screens-judge.py" "$OUT" "${SCREENS[@]}" || FAILED=1
rm -f "$OUT"/*/*.bmp

# 고정 데이터 재생인데 녹화에 없던 쿼리가 있으면 그 화면은 빈 데이터로 찍힌 것 — 실패로 본다(새 쿼리면 SCREENS_MODE=record).
if [ -n "$API_URL" ] && [ "${SCREENS_MODE:-replay}" != record ]; then
  MISSING=$(curl -sf "http://localhost:$PORT/__missing" || echo '["(고정 데이터 서버 응답 없음)"]')
  if [ "$MISSING" != "[]" ]; then
    echo "✗ 녹화 안 된 쿼리: $MISSING" | cut -c1-500
    MISSING="$MISSING" python3 -c '
import json, os, sys
items = json.loads(os.environ["MISSING"])
with open(sys.argv[1], "a") as f:
    f.write("\n## ❌ 녹화 안 된 쿼리 — SCREENS_API=fixture SCREENS_MODE=record 로 다시 녹화\n\n")
    f.writelines(f"- {m}\n" for m in items)' "$OUT/report.md"
    FAILED=1
  fi
fi

[ "$FAILED" = 0 ] && echo "앱 화면 하네스 통과" || { echo "앱 화면 하네스 실패 — $OUT/report.md"; exit 1; }
