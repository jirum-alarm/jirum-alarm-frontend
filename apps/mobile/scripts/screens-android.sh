#!/usr/bin/env bash
# 앱 화면 하네스(안드로이드) — screens-ios.sh 의 안드로이드판. 이 커밋의 JS 를 Release APK 에 끼워 에뮬레이터에서
# 주요 화면을 딥링크로 열고 라이트·다크로 찍는다.
#
#   scripts/screens-android.sh <app-release.apk>      # 에뮬레이터 하나가 adb 에 붙어 있어야 한다(여럿이면 ANDROID_SERIAL)
#   → screens-out-android/<light|dark>/<화면>.png + report.md  (AI 는 report.md → png 순으로 본다)
#
# 판정은 iOS 와 같은 scripts/screens-judge.py(빈 화면·앱 종료·치명 예외·홈과 같은 그림·다크 미적용).
# iOS 와 다른 점:
#   - 딥링크는 `am start -a VIEW -d` 로 바로 콜드 스타트한다 — iOS 처럼 «열겠습니까?» 확인 창이 없어 하네스 입구(AsyncStorage)가 필요 없다.
#   - expo-updates 를 끌 수 없다(설정이 바이너리 매니페스트) → 화면마다 받은 OTA(files/.expo-internal·databases/updates.db*)를 지워
#     늘 이 커밋의 내장 번들로 뜨게 한다. 그래서 root 가 되는 이미지(google_apis — Play 이미지는 안 된다)가 필요하다.
#     root 가 안 되면 두 번째 화면부터 운영 OTA 가 덮을 수 있어 실패로 멈춘다.
#   - 다크는 `cmd uimode night yes|no`(앱이 OS 설정을 따른다).
# 준비(번들 갈아 끼우기·재서명)는 boot-check-android.sh 와 같다 — 바꾸면 둘 다. SCREENS_SKIP_EXPORT=1 이면 APK 의 번들을 그대로 쓴다.
# 데이터는 iOS 와 같이 운영 API — 첫 실행 게스트 생성(쓰기)이 막히면 모든 화면이 로그인 첫 화면으로 찍힌다(판정이 한 줄로 알려 준다).
set -euo pipefail

APK_SRC=${1:?사용법: screens-android.sh <Release .apk>}
PKG=com.solcode.jirmalam
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${SCREENS_OUT:-$ROOT/screens-out-android}
WAIT=${SCREENS_WAIT:-15}
BT=$(ls -d "${ANDROID_HOME:?ANDROID_HOME 필요}"/build-tools/* | sort -V | tail -1)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# 화면 이름 → 딥링크(커스텀 스킴). screens-ios.sh 와 같은 목록 — 화면을 더하면 둘 다.
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

cp "$APK_SRC" "$WORK/in.apk"
if [ "${SCREENS_SKIP_EXPORT:-}" != 1 ]; then
  echo "▶ JS 번들(Hermes) 생성"
  (cd "$ROOT" && npx expo export --platform android --output-dir "$WORK/export" >/dev/null)
  mkdir -p "$WORK/stage/assets"
  cp "$WORK"/export/_expo/static/js/android/*.hbc "$WORK/stage/assets/index.android.bundle"
  # 옛 서명 파일만 지운다 — META-INF/* 통째로 지우면 services/ 까지 빠져 시작하자마자 죽는다(boot-check-android.sh 참고).
  zip -q -d "$WORK/in.apk" 'META-INF/*.SF' 'META-INF/*.RSA' 'META-INF/*.EC' 'META-INF/*.DSA' 'META-INF/MANIFEST.MF' >/dev/null 2>&1 || true
  (cd "$WORK/stage" && zip -q -0 "$WORK/in.apk" assets/index.android.bundle)
  "$BT/zipalign" -p -f 4 "$WORK/in.apk" "$WORK/app.apk"
  keytool -genkeypair -keystore "$WORK/ks" -storepass android -keypass android -alias k -keyalg RSA \
    -keysize 2048 -validity 1 -dname CN=app-screens >/dev/null 2>&1
  "$BT/apksigner" sign --ks "$WORK/ks" --ks-pass pass:android "$WORK/app.apk"
else
  cp "$WORK/in.apk" "$WORK/app.apk"
fi

adb wait-for-device
if ! adb root 2>&1 | grep -qE "restarting adbd as root|already running as root"; then
  echo "✗ adb root 가 안 된다 — 받은 OTA 를 지울 수 없어 이 커밋 번들을 본다고 보장 못 한다(google_apis 이미지를 쓸 것)"
  exit 1
fi
adb wait-for-device
adb uninstall "$PKG" >/dev/null 2>&1 || true
adb install "$WORK/app.apk" >/dev/null
ACTIVITY=$(adb shell cmd package resolve-activity --brief "$PKG" | tail -1 | tr -d '\r')
DATA=/data/data/$PKG

rm -rf "$OUT"
mkdir -p "$OUT/light" "$OUT/dark"
adb logcat -c
FAILED=0

# 화면 하나 = 콜드 스타트 하나. 받은 OTA 만 지우고 저장소(RKStorage — deviceId·게스트 토큰)는 둔다 — 지우면 켤 때마다 새 게스트가 생긴다.
capture() { # <theme> <name> [url]
  adb shell am force-stop "$PKG"
  adb shell "rm -rf $DATA/files/.expo-internal $DATA/databases/updates.db $DATA/databases/updates.db-shm $DATA/databases/updates.db-wal"
  if [ -n "${3:-}" ]; then
    adb shell am start -W -a android.intent.action.VIEW -d "'$3'" "$PKG" >/dev/null
  else
    adb shell am start -W -n "$ACTIVITY" >/dev/null
  fi
  sleep "$WAIT"
  adb exec-out screencap -p >"$OUT/$1/$2.png" 2>/dev/null || true
  if adb shell pidof "$PKG" >/dev/null; then
    echo "  찍음 $1/$2"
  else
    echo "✗ $1/$2: 앱이 종료됨"
    rm -f "$OUT/$1/$2.png"
    FAILED=1
  fi
}

for THEME in light dark; do
  echo "▶ $THEME"
  if [ "$THEME" = dark ]; then adb shell cmd uimode night yes >/dev/null; else adb shell cmd uimode night no >/dev/null; fi
  # 설치 뒤 첫 실행은 첫 안내 시트가 덮는다 — 그 자체도 화면이라 따로 찍고, 나머지는 두 번째 실행부터.
  [ "$THEME" = light ] && capture "$THEME" first-launch
  capture "$THEME" home
  for entry in "${SCREENS[@]}"; do
    capture "$THEME" "${entry%% *}" "${entry#* }"
  done
done
adb shell cmd uimode night no >/dev/null

if adb logcat -d | grep -E "FATAL EXCEPTION|JavascriptException|Unhandled JS Exception" >"$WORK/fatal.txt"; then
  echo "✗ 치명 예외"
  head -3 "$WORK/fatal.txt" | cut -c1-300
  FAILED=1
fi

# 그림 판정 — 64px 폭 BMP 로 줄여 screens-judge.py 가 픽셀을 센다(맥은 sips, 리눅스 러너는 ImageMagick).
for f in "$OUT"/*/*.png; do
  if command -v sips >/dev/null; then
    sips -s format bmp --resampleWidth 64 "$f" --out "${f%.png}.bmp" >/dev/null 2>&1
  else
    convert "$f" -resize 64x -type TrueColor "BMP3:${f%.png}.bmp"
  fi
done
FATAL_LOG="$WORK/fatal.txt" SCREENS_TITLE="앱 화면 하네스 결과 (Android)" python3 "$(dirname "$0")/screens-judge.py" "$OUT" "${SCREENS[@]}" || FAILED=1
rm -f "$OUT"/*/*.bmp

[ "$FAILED" = 0 ] && echo "앱 화면 하네스(Android) 통과" || { echo "앱 화면 하네스(Android) 실패 — $OUT/report.md"; exit 1; }
