#!/usr/bin/env bash
# 안드로이드 기동 확인 — boot-check.sh(iOS) 의 안드로이드판. 이 커밋의 JS 를 Release APK 에 끼워 에뮬레이터에서 켜 본다.
#
#   scripts/boot-check-android.sh <app-release(-unsigned).apk>   # 에뮬레이터 하나가 adb 에 붙어 있어야 한다
#
# 어떻게: APK 의 assets/index.android.bundle 만 이 커밋의 Hermes 바이트코드(OTA 와 같은 산출물)로 바꾸고 다시 서명한다.
#   그래서 APK 는 네이티브 지문이 같은 아무 Release 빌드나 써도 된다(CI 는 지문으로 캐시). ABI 는 에뮬레이터 것이 들어 있어야 한다.
# 판정: 매번 새로 설치해 콜드 스타트 2회 — BOOT_WAIT 초 뒤 ① 프로세스 생존 ② logcat 에 치명 예외 없음
#   ③ 화면에 앱이 그린 글자가 있다(uiautomator) — JS 가 실제로 돌아 첫 화면을 그렸다는 증거.
# iOS 와 다른 점:
#   - expo-updates 를 끌 수 없다(설정이 바이너리 매니페스트에 있다) → 매번 지우고 새로 설치해 받은 OTA 를 비우고 내장 번들로 뜨게 한다.
#     `pm clear` 를 쓰면 CI 에뮬레이터에서 GMS 가 죽고 앱이 함께 정리되는 일이 실행당 한 번꼴로 있었다(10/9, hind 세션 분석).
#   - Release 는 run-as 가 안 돼 AsyncStorage 에 토큰을 못 넣는다 → 로그인 경로는 iOS 쪽만 본다.
# ponytail: JS 가 그린 뒤 오류 없이 깨진 화면은 못 잡는다 — 사고로 나오면 스크린샷 비교를 더한다.
set -euo pipefail

APK_SRC=${1:?사용법: boot-check-android.sh <Release .apk>}
PKG=com.solcode.jirmalam
WAIT=${BOOT_WAIT:-20}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
BT=$(ls -d "${ANDROID_HOME:?ANDROID_HOME 필요}"/build-tools/* | sort -V | tail -1)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

echo "▶ JS 번들(Hermes) 생성"
(cd "$ROOT" && npx expo export --platform android --output-dir "$WORK/export" >/dev/null)
cp "$APK_SRC" "$WORK/in.apk"
mkdir -p "$WORK/stage/assets"
cp "$WORK"/export/_expo/static/js/android/*.hbc "$WORK/stage/assets/index.android.bundle"
# 옛 서명 파일만 지운다(다시 서명). META-INF/* 를 통째로 지우면 services/(ServiceLoader 등록)까지 빠져
# 코루틴 Main 디스패처 초기화가 깨지고 앱이 시작하자마자 죽는다(10/10 실측 — 가짜 실패).
zip -q -d "$WORK/in.apk" 'META-INF/*.SF' 'META-INF/*.RSA' 'META-INF/*.EC' 'META-INF/*.DSA' 'META-INF/MANIFEST.MF' >/dev/null 2>&1 || true
(cd "$WORK/stage" && zip -q -0 "$WORK/in.apk" assets/index.android.bundle)
"$BT/zipalign" -p -f 4 "$WORK/in.apk" "$WORK/app.apk"
keytool -genkeypair -keystore "$WORK/ks" -storepass android -keypass android -alias k -keyalg RSA \
  -keysize 2048 -validity 1 -dname CN=boot-check >/dev/null 2>&1
"$BT/apksigner" sign --ks "$WORK/ks" --ks-pass pass:android "$WORK/app.apk"

adb wait-for-device
adb uninstall "$PKG" >/dev/null 2>&1 || true # 실행마다 새 키로 서명하니 덮어쓰기(-r)는 서명 불일치로 거부된다
adb install "$WORK/app.apk" >/dev/null
ACTIVITY=$(adb shell cmd package resolve-activity --brief "$PKG" | tail -1 | tr -d '\r')

# 한 번 켜 본다. 0=통과 1=실패 2=크래시 기록 없이 사라짐(재시도 대상).
attempt() {
  adb uninstall "$PKG" >/dev/null 2>&1 || true
  adb install "$WORK/app.apk" >/dev/null
  adb logcat -c
  adb shell am start -n "$ACTIVITY" >/dev/null
  sleep "$WAIT"
  if ! adb shell pidof "$PKG" >/dev/null; then
    echo "✗ $1: ${WAIT}초 안에 종료됨"
    # 자바 크래시가 아니면(네이티브 tombstone·ANR·메모리 부족 kill) FATAL EXCEPTION 이 안 찍힌다 — 왜 죽었는지 남긴다.
    adb logcat -d -b crash | tail -25
    adb logcat -d | grep -iE "ActivityManager|lowmemorykiller|libc|DEBUG|$PKG" | grep -iE "died|kill|anr|crash|fatal|signal|exit|start proc" | tail -20
    adb logcat -d | grep -E "Killing [0-9]+:$PKG" | cut -c1-300 # 누가 왜 죽였나(예: depends on provider … in dying proc)
    adb logcat -d -b main,crash | grep -qE "FATAL EXCEPTION|JavascriptException|Fatal signal" && return 1
    return 2
  fi
  if adb logcat -d | grep -E "FATAL EXCEPTION|JavascriptException|Unhandled JS Exception" >"$WORK/fatal.txt"; then
    echo "✗ $1: 치명 예외"
    head -3 "$WORK/fatal.txt" | cut -c1-300
    return 1
  fi
  # 애니메이션 중엔 dump 가 "could not get idle state" 로 실패할 수 있어 몇 번 다시 잡는다.
  local ui=""
  for _ in 1 2 3; do
    ui=$(adb exec-out uiautomator dump /dev/tty 2>/dev/null || true)
    grep -q "package=\"$PKG\"" <<<"$ui" && break
    sleep 2
  done
  if ! grep -E "text=\"[^\"]+\"[^>]*package=\"$PKG\"" <<<"$ui" >/dev/null; then
    echo "✗ $1: 앱 화면에 글자가 없음 — JS 가 첫 화면을 그리지 못함(스플래시·빈 화면에서 멈춤)"
    return 1
  fi
  echo "✓ $1: ${WAIT}초 동안 생존·치명 예외 없음·첫 화면 그림"
  adb shell am force-stop "$PKG"
}

# 크래시 기록(자바·JS·네이티브 Fatal signal) 없이 사라지면 1회 다시 켠다 — CI 에뮬레이터에서 GMS 사망·lowmemorykiller 로
# 앱이 정리되는 일이 있었다(10/9 run 37954971729·37963092337, 둘 다 2회차, 로컬 재현 안 됨).
# ponytail: 재시도는 1회 — 진짜 기동 크래시는 크래시 기록이 남거나 두 번 다 죽는다. 재시도가 잦아지면 에뮬레이터 자원부터 본다.
launch() {
  local rc=0
  attempt "$1" || rc=$?
  [ "$rc" = 0 ] && return
  if [ "$rc" = 2 ]; then
    echo "↻ $1: 크래시 기록 없이 사라짐 — 에뮬레이터 자원 문제로 보고 1회 재시도"
    attempt "$1(재시도)" && return
  fi
  exit 1
}

launch "콜드 스타트 1"
launch "콜드 스타트 2"
echo "기동 확인 통과"
