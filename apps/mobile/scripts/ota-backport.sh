#!/usr/bin/env bash
# 옛 runtime(스토어에 나가 있는 버전)에 main 커밋을 백포트해 OTA 로 낸다 — 단계마다 막는다.
#
#   scripts/ota-backport.sh --runtime 1.5.0 --app <그 runtime 의 Release .app> [--message "…"] [--dry-run] [--keep] <커밋…>
#
# 왜: main 은 다음 스토어 버전(runtime)으로 먼저 올라가 있어서 main 푸시 자동 OTA 는 스토어 사용자에게 안 간다.
#   스토어 버전마다 origin ota/runtime-<버전> 브랜치에 cherry-pick 해 손으로 발행해 왔는데(10/12 하루 여섯 번),
#   손으로 하다 세 번 걸렸다:
#   ① 워크트리를 만든 뒤 다른 세션이 같은 브랜치에 올리고 발행 → 옛 끝에서 발행해 남의 기능을 ~4분 덮었다
#      → 발행 **직전에** 원격 끝을 다시 받아, 내 HEAD 에 없는 커밋이 있으면 멈춘다.
#   ② jest 가 전부 통과하고도 exit 1(렌더 트리 안 거둠) — --forceExit 로 돌리면 안 보인다
#      → CI 와 같게 `jest --runInBand`, 종료 코드로 판정.
#   ③ 브랜치 push 가 `remote rejected (failure)` 로 가끔 거절 → 재시도 후 원격 끝 == HEAD 확인.
#   ①은 발행이 몇 분 걸리는 사이 끼어드는 경우까지는 못 막는다 — 그건 ota:publish 가 맡는다(a894446d: 발행 **전에**
#   브랜치를 먼저 push 해 차지하고, fast-forward 거절이면 멈춘다). 이 스크립트의 재확인은 그 앞의 싼 관문이다.
# 순서: 워크트리(원격 끝) → cherry-pick → 그 커밋 lockfile 로 설치 → tsc·지문·jest → 기동 확인 → 원격 끝 재확인
#   → pnpm ota:publish(그 브랜치의 스크립트 — 지문·소스맵) → push → 운영 매니페스트가 새 update id 를 내주는지.
# --dry-run: 발행·push 직전까지만. --keep: 끝나도 워크트리를 남긴다(기본은 성공 시 지운다, 실패 시 남긴다).
# ⚠️ query-cache 의 QUERY_DOCS_FINGERPRINT 는 브랜치마다 다르다 — gql 문서가 바뀐 커밋이면 jest 가 그 브랜치 값을 알려 주며 멈춘다.
set -euo pipefail

RUNTIME=""
APP=""
MESSAGE=""
DRY=0
KEEP=0
COMMITS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --runtime) RUNTIME=$2; shift 2 ;;
    --app) APP=$2; shift 2 ;;
    --message) MESSAGE=$2; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --keep) KEEP=1; shift ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) COMMITS+=("$1"); shift ;;
  esac
done
[ -n "$RUNTIME" ] || { echo "--runtime 이 필요하다(예: 1.5.0)" >&2; exit 2; }
[ -d "$APP" ] || { echo "--app 에 그 runtime 의 Release .app 경로가 필요하다(기동 확인용)" >&2; exit 2; }
[ ${#COMMITS[@]} -gt 0 ] || { echo "백포트할 커밋을 하나 이상 준다" >&2; exit 2; }

MOBILE=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(git -C "$MOBILE" rev-parse --show-toplevel)
BRANCH="ota/runtime-$RUNTIME"
BOOT_CHECK="$MOBILE/scripts/boot-check.sh" # main 의 것을 쓴다(옛 브랜치엔 없거나 낡았다)
WT=$(mktemp -d "${TMPDIR:-/tmp}/ota-backport-$RUNTIME-XXXX")
rmdir "$WT"
LOCAL_BRANCH="ota/backport-$RUNTIME-$(date +%m%d%H%M%S)"

step() { printf '\n▶ %s\n' "$*"; }
die() {
  printf '\n✗ %s\n' "$*" >&2
  echo "  워크트리를 남겨 둔다: $WT (정리: git -C $REPO worktree remove --force $WT)" >&2
  exit 1
}

# 앱 버전이 runtime 과 맞는지 — 엉뚱한 .app 으로 기동 확인하면 판정이 무의미하다.
APP_VERSION=$(/usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$APP/Info.plist" 2>/dev/null || echo '?')
[ "$APP_VERSION" = "$RUNTIME" ] || { echo "--app 의 버전($APP_VERSION) ≠ runtime($RUNTIME)" >&2; exit 2; }

# 기동 확인용 앱을 먼저 복사해 둔다 — 남의 scratchpad 사본을 가리키면 도중에 지워질 수 있다(10/12 실측).
APP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/ota-backport-app-XXXX")
trap 'rm -rf "$APP_DIR"' EXIT
APP_COPY=$APP_DIR/app.app
cp -R "$APP" "$APP_COPY"
APP=$APP_COPY

step "워크트리 — origin/$BRANCH 끝에서"
git -C "$REPO" fetch -q origin "$BRANCH"
git -C "$REPO" worktree add -q -b "$LOCAL_BRANCH" "$WT" "origin/$BRANCH"
BASE=$(git -C "$WT" rev-parse --short HEAD)
echo "  기준 $BASE ($WT)"

step "cherry-pick ${COMMITS[*]}"
for c in "${COMMITS[@]}"; do
  git -C "$WT" cherry-pick "$c" >/dev/null 2>&1 ||
    die "$c cherry-pick 충돌 — 그 버전에 있던 코드로 손으로 풀고(git -C $WT status) 이 스크립트 대신 나머지 단계를 따른다"
done
git -C "$WT" log --oneline "$BASE..HEAD"

cd "$WT/apps/mobile"

step "설치 — 그 커밋의 lockfile 로"
(cd "$WT" && pnpm install --frozen-lockfile >/dev/null 2>&1) || die "pnpm install --frozen-lockfile 실패"

step "화면 캐시 지문 — 브랜치마다 값이 다르다"
# GraphQL 문서가 브랜치마다 달라 QUERY_DOCS_FINGERPRINT 도 다르다. 어긋나면 테스트가 이 브랜치의 값을 알려 준다 —
# 그 값을 넣고 커밋한다(값이 바뀌면 그 버전 사용자의 화면 캐시가 한 번 버려진다 — 문서가 달라졌으니 맞다).
if [ -f __tests__/query-cache.test.ts ] && grep -q QUERY_DOCS_FINGERPRINT src/shared/lib/persistence/query-cache.ts; then
  FP_OUT=$(npx jest --runInBand __tests__/query-cache.test.ts -t '지문이 지금 문서와 맞는다' 2>&1 || true)
  EXPECTED=$(printf '%s' "$FP_OUT" | grep -o 'Expected: "[0-9a-f]*"' | head -1 | cut -d'"' -f2)
  if [ -n "$EXPECTED" ]; then
    sed -i '' "s/export const QUERY_DOCS_FINGERPRINT = '[0-9a-f]*';/export const QUERY_DOCS_FINGERPRINT = '$EXPECTED';/" \
      src/shared/lib/persistence/query-cache.ts
    git commit -q -m "chore(mobile): $BRANCH 캐시 지문 $EXPECTED" -- src/shared/lib/persistence/query-cache.ts
    echo "  지문을 $EXPECTED 로 맞춰 커밋"
  else
    echo "  그대로"
  fi
fi

step "tsc · 네이티브 지문"
npx tsc --noEmit -p . || die "tsc 실패"
node scripts/native-fingerprint.mjs --check || die "네이티브 지문이 runtime $RUNTIME 과 다르다 — JS 만이 아닌 변경은 백포트할 수 없다"

step "jest — CI 와 같게(--runInBand, 종료 코드로 판정)"
JEST_LOG=$(mktemp "${TMPDIR:-/tmp}/ota-backport-jest-XXXX")
if ! npx jest --runInBand >"$JEST_LOG" 2>&1; then
  grep -E 'Tests:|Suites:|✕|● ' "$JEST_LOG" | head -20 >&2
  grep -q 'Cannot log after tests are done' "$JEST_LOG" &&
    echo "  ↑ 통과 수가 다 맞는데 실패면 렌더 테스트가 트리를 안 거둔 것(53e4e746 류 정리가 이 브랜치에 있는지)" >&2
  die "jest 실패(로그 $JEST_LOG)"
fi
grep -E 'Tests:|Suites:' "$JEST_LOG"

step "기동 확인 — $APP (콜드 스타트 3회)"
COPIED=0
if [ ! -f scripts/boot-check.sh ] || ! cmp -s scripts/boot-check.sh "$BOOT_CHECK"; then
  cp "$BOOT_CHECK" scripts/boot-check.sh
  COPIED=1
fi
BOOT_OK=0
bash scripts/boot-check.sh "$APP" && BOOT_OK=1
# 발행 전에 작업 트리를 커밋 그대로 되돌린다(지문·발행 내용에 섞이지 않게).
if [ $COPIED = 1 ]; then
  git checkout -q -- scripts/boot-check.sh 2>/dev/null || rm -f scripts/boot-check.sh
fi
[ $BOOT_OK = 1 ] || die "기동 확인 실패"
[ -z "$(git status --porcelain)" ] || die "작업 트리가 커밋과 다르다: $(git status --porcelain | head -3)"

step "원격 끝 재확인 — 그 사이 다른 세션이 올렸나"
git fetch -q origin "$BRANCH"
NEW=$(git log --oneline "HEAD..origin/$BRANCH")
[ -z "$NEW" ] || die "origin/$BRANCH 에 내 HEAD 에 없는 커밋이 생겼다 — 발행하면 그걸 덮는다:
$NEW
  → 다시 실행하면 새 끝에서 시작한다"

HEAD_SHA=$(git rev-parse --short HEAD)
MSG=${MESSAGE:-"$(git log -1 --format=%s HEAD) ($RUNTIME 백포트)"}
if [ $DRY = 1 ]; then
  step "dry-run — 여기서 멈춘다(발행·push 안 함). HEAD $HEAD_SHA"
  echo "  발행 메시지가 될 것: $MSG"
  [ $KEEP = 1 ] || { cd "$REPO"; git worktree remove --force "$WT"; git branch -q -D "$LOCAL_BRANCH"; }
  exit 0
fi

step "발행 — $MSG"
pnpm -s ota:publish "$MSG" || die "ota:publish 실패"

step "push — origin/$BRANCH"
for i in 1 2 3; do
  git push -q origin "HEAD:$BRANCH" 2>/dev/null && break
  sleep 3
done
REMOTE=$(git ls-remote origin "$BRANCH" | cut -c1-8)
[ "$REMOTE" = "${HEAD_SHA:0:8}" ] || die "발행은 됐는데 브랜치 push 가 안 됐다(origin=$REMOTE, HEAD=$HEAD_SHA) — 손으로 push"

step "운영 매니페스트가 새 update 를 내주는가"
UPDATES=$(npx eas update:list --branch production --limit 8 --json --non-interactive 2>/dev/null)
GROUP=$(printf '%s' "$UPDATES" | python3 -c '
import json, sys
d = json.load(sys.stdin); rt, msg = sys.argv[1], sys.argv[2]
rows = d.get("currentPage", d)
print(next((u["group"] for u in rows if u["runtimeVersion"] == rt and msg in u.get("message", "")), ""))
' "$RUNTIME" "$MSG")
[ -n "$GROUP" ] || die "방금 발행한 group 을 목록에서 못 찾았다"
PROJECT=$(node -p 'require("./app.json").expo.extra.eas.projectId')
npx eas update:view "$GROUP" --json 2>/dev/null | python3 -c '
import json, sys
for u in json.load(sys.stdin): print(u["platform"], u["id"])
' | while read -r platform id; do
  served=$(curl -s "https://u.expo.dev/$PROJECT" -H 'expo-channel-name: production' \
    -H "expo-runtime-version: $RUNTIME" -H "expo-platform: $platform" \
    -H 'accept: multipart/mixed' -H 'expo-protocol-version: 1' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  [ "$served" = "$id" ] || { echo "✗ $platform 매니페스트가 $served (기대 $id)" >&2; exit 1; }
  echo "  $platform $id ✓"
done || die "매니페스트 확인 실패"

echo
echo "✓ 백포트 완료 — runtime $RUNTIME group $GROUP, origin/$BRANCH = $HEAD_SHA"
cd "$REPO"
[ $KEEP = 1 ] || { git worktree remove --force "$WT"; git branch -q -D "$LOCAL_BRANCH"; }
