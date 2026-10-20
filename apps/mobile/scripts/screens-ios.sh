#!/usr/bin/env bash
# 앱 화면 하네스 — 이 커밋의 JS 를 Release 앱에 끼워 iOS 시뮬레이터에서 주요 화면을 딥링크로 열고 라이트·다크로 찍는다.
#
#   scripts/screens-ios.sh <Release-iphonesimulator/jirumAlarmMobile.app>
#   → screens-out/<light|dark>/<화면>.png + screens-out/report.md  (AI 는 report.md → png 순으로 본다)
#
# 왜: boot-check 는 «켜지나»만 본다. 화면이 비었는지·다크에서 흰 판이 남았는지는 찍어 봐야 안다(web 의 apps/web/screens 와 같은 목적).
# 데이터: 운영 API 를 그대로 읽는다 — 앱 GraphQL 주소가 빌드 상수(shared/constant/endpoint.ts)라 web 하네스의 고정 데이터 서버에
#   붙이지 않는다. 그래서 화면 내용은 실행마다 다르다(판정은 내용이 아니라 «비었나·죽었나·다크가 먹었나»).
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
cleanup() {
  [ -n "$LOGPID" ] && kill "$LOGPID" 2>/dev/null
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
  HARNESS_URL="${3:-}" python3 -c '
import json, os, sys
path = os.path.join(sys.argv[1], "manifest.json")
data = json.load(open(path)) if os.path.exists(path) else {}
data.pop("jirum:screens-harness-url", None)
if os.environ["HARNESS_URL"]:
    data["jirum:screens-harness-url"] = os.environ["HARNESS_URL"]
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
FATAL_LOG="$WORK/fatal.txt" python3 - "$OUT" "${SCREENS[@]}" <<'PY' || FAILED=1
import os, struct, sys
out = sys.argv[1]
names = ['first-launch', 'home'] + [e.split(' ', 1)[0] for e in sys.argv[2:]]

def pixels(path):
    with open(path, 'rb') as fh:
        data = fh.read()
    off = struct.unpack_from('<I', data, 10)[0]
    w, h = struct.unpack_from('<ii', data, 18)
    bpp = struct.unpack_from('<H', data, 28)[0] // 8
    row = (w * bpp + 3) & ~3
    px = []
    for y in range(abs(h)):
        if (y if h < 0 else abs(h) - 1 - y) < abs(h) * 0.08:  # 상태 표시줄
            continue
        base = off + y * row
        for x in range(w):
            b, g, r = data[base + x * bpp: base + x * bpp + 3]
            px.append((r, g, b))
    return px

def stats(path):
    px = pixels(path)
    buckets = {}
    for r, g, b in px:
        k = (r // 16, g // 16, b // 16)
        buckets[k] = buckets.get(k, 0) + 1
    dominant = max(buckets.values()) / len(px)
    bright = sum(1 for r, g, b in px if (r + g + b) / 3 > 200) / len(px)
    return px, dominant, bright

def changed(a, b):
    return sum(1 for p, q in zip(a, b) if abs(sum(p) - sum(q)) > 60) / len(a)

lines = ['# 앱 화면 하네스 결과', '', '| 화면 | 라이트 | 다크 | 문제 |', '|---|---|---|---|']
failed = False
home = {}
for name in names:
    issues = []
    got = {}
    themes = ('light',) if name == 'first-launch' else ('light', 'dark')
    for theme in themes:
        bmp = os.path.join(out, theme, name + '.bmp')
        if not os.path.exists(bmp):
            issues.append(f'❌ {theme}: 캡처 없음(앱이 죽었다)')
            failed = True
            continue
        got[theme] = stats(bmp)
        px, dominant, bright = got[theme]
        if dominant > 0.97:
            issues.append(f'❌ {theme}: 거의 한 색({dominant:.0%}) — 빈 화면')
            failed = True
        if theme == 'dark' and bright > 0.5:
            issues.append(f'⚠️ dark: 밝은 면 {bright:.0%} — 흰 판·웹뷰가 다크를 안 따르나')
        if name == 'home':
            home[theme] = px
        elif name != 'first-launch' and theme in home and changed(px, home[theme]) < 0.1:
            # 딥링크가 화면을 못 바꾸면 홈이 그대로 찍힌다 — 처음 만들 때 실제로 이렇게 «통과»했다.
            issues.append(f'❌ {theme}: 홈과 거의 같은 그림 — 그 화면으로 못 갔다')
            failed = True
    if len(got) == 2:
        diff = changed(got['light'][0], got['dark'][0])
        if diff < 0.2:
            issues.append(f'⚠️ 라이트·다크가 거의 같다(다른 픽셀 {diff:.0%}) — 다크 미적용')
    dark = '—' if name == 'first-launch' else f'`dark/{name}.png`'
    lines.append(f'| {name} | `light/{name}.png` | {dark} | {"<br>".join(issues) or "—"} |')
fatal = open(os.environ['FATAL_LOG']).read().strip() if os.path.exists(os.environ['FATAL_LOG']) else ''
if fatal:
    lines += ['', '## ❌ 치명 JS 예외', '```', fatal[:1500], '```']
open(os.path.join(out, 'report.md'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
sys.exit(1 if failed else 0)
PY
rm -f "$OUT"/*/*.bmp

[ "$FAILED" = 0 ] && echo "앱 화면 하네스 통과" || { echo "앱 화면 하네스 실패 — $OUT/report.md"; exit 1; }
