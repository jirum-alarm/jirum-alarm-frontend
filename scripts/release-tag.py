#!/usr/bin/env python3
"""운영 웹 릴리스 태그 — 태그 절차의 함정(preflight frontend-release)을 한 명령으로 묶는다.

  python3 scripts/release-tag.py [--sha <ref>] [--bump minor|patch|major] [--summary "…"] [--dry-run] [--no-wait]

순서와 각 단계가 막는 사고:
  ① 원격 기준 태그·main fetch, 대상 커밋이 origin/main 에 들어 있는지  — 고아 태그(v1.13.107, 07-30)
  ② 직전 태그 이후 apps/web·packages 변경(diff --stat)과 같이 나갈 admin·ai 배포 목록  — 포함분 모르고 태그(v1.24.2)
  ③ feat → minor / 그 외 → patch 자동 결정  — feat 에 patch(09-26)
  ④ 빌드 관문: 그 커밋(또는 웹 입력이 같은 커밋)의 deploy-web-staging 성공  — 남의 미커밋 덕에 통과한 로컬 tsc(v1.13.116)
  ⑤ GraphQL 관문: 웹·어드민 문서를 운영 스키마로 검증, 직전 태그 대비 새 오류면 중단  — 서버보다 먼저 나간 웹(08-01 Unknown argument)
  ⑥ annotated 태그 push — 번호가 이미 있으면(다른 세션) 다시 계산해 재시도  — v1.65.0 충돌(10-09)
  ⑦ deploy-web-prod 결과를 conclusion 으로 판정(취소면 뒤 태그 포함 여부) → gitops scripts/deploy-verify.py  — CI 초록≠배포
  ⑧ 운영 HTML 을 검색 봇 UA 로 받아 noindex·h1·canonical·JSON-LD·본문 확인(scripts/seo-check.py)  — 파드는 떴는데 봇이 받는 HTML 이 깨진 배포(데스크톱 h1 2달, 09-02)

로컬 잠금(~/.cache/jirum-release-tag/lock)으로 이 맥의 세션끼리는 한 번에 하나만 태그한다.
exit 0 = 배포 확인(또는 할 일 없음), 1 = 관문·배포 실패, 2 = 환경 오류.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

REPO = 'jirum-alarm/jirum-alarm-frontend'
PUSH_URL = 'git@github.com-tjsry0466:jirum-alarm/jirum-alarm-frontend.git'  # HTTPS origin 은 회사 계정으로 403
WEB_PATHS = ['apps/web', 'packages']
PROD_SCHEMA = 'https://jirum-api.kyojs.com/graphql'
CACHE = os.path.expanduser('~/.cache/jirum-release-tag')
GITOPS = os.environ.get('JIRUM_GITOPS', os.path.expanduser('~/Documents/github/jirum-alarm/jirum-alarm-gitops'))
HERE = os.path.dirname(os.path.abspath(__file__))
TOP = os.path.dirname(HERE)
SEMVER = re.compile(r'^v(\d+)\.(\d+)\.(\d+)$')


def log(msg):
    print(msg, flush=True)


def die(msg, code=1):
    log(f'❌ {msg}')
    raise SystemExit(code)


def sh(*cmd, check=True, cwd=TOP, env=None):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, env=env)
    if check and p.returncode != 0:
        die(f'{" ".join(cmd)} → {p.stderr.strip()[:400]}', 2)
    return p.stdout.strip()


def git(*args, check=True):
    return sh('git', *args, check=check)


def is_ancestor(a, b):
    return subprocess.run(['git', 'merge-base', '--is-ancestor', a, b], cwd=TOP).returncode == 0


_gh_env = None


def gh(*args):
    """jirum 계정 토큰으로 gh. core 한도(5,000/h)는 이 맥의 모든 세션이 나눠 쓴다 — 바닥나면 리셋까지 기다린다
    (2026-10-15 실측: 여러 세션의 `gh run watch`(3초 간격)가 한도를 소진해 403)."""
    global _gh_env
    if _gh_env is None:
        token = sh('gh', 'auth', 'token', '--user', 'tjsry0466', check=False)
        _gh_env = {**os.environ, **({'GH_TOKEN': token} if token else {})}
    for _ in range(20):
        p = subprocess.run(['gh', *args], cwd=TOP, capture_output=True, text=True, env=_gh_env)
        if p.returncode == 0:
            return p.stdout.strip()
        if 'rate limit' not in p.stderr:
            die(f'gh {" ".join(args)} → {p.stderr.strip()[:400]}', 2)
        log('⏳ GitHub API 한도 소진 — 60초 뒤 재시도')
        time.sleep(60)
    die('GitHub API 한도가 20분째 풀리지 않음', 2)


# ── 잠금 ───────────────────────────────────────────────────────────────────

class Lock:
    path = os.path.join(CACHE, 'lock')

    def __enter__(self):
        os.makedirs(CACHE, exist_ok=True)
        for _ in range(60):
            try:
                os.mkdir(self.path)
                with open(os.path.join(self.path, 'owner'), 'w') as f:
                    f.write(f'{os.getpid()} {time.strftime("%F %T")}\n')
                return self
            except FileExistsError:
                if self._owner_dead() or time.time() - os.path.getmtime(self.path) > 3600:
                    shutil.rmtree(self.path, ignore_errors=True)  # 죽은 세션이 남긴 잠금
                    continue
                if _ == 0:
                    log(f'⏳ 다른 세션이 태그 중({self.path}) — 대기')
                time.sleep(10)
        die('잠금 10분 대기 초과', 2)

    def _owner_dead(self):
        """잠금을 잡은 프로세스가 이미 없으면 죽은 잠금이다(2026-10-15: 태그 뒤 세션이 끊겨 남은 잠금에 10분 막혔다)."""
        try:
            with open(os.path.join(self.path, 'owner')) as f:
                pid = int(f.read().split()[0])
            os.kill(pid, 0)
            return False
        except ProcessLookupError:
            return True
        except (OSError, ValueError, IndexError):
            return False  # owner 파일을 아직 못 썼거나 권한 문제 — 기다린다

    def __exit__(self, *exc):
        shutil.rmtree(self.path, ignore_errors=True)


# ── ①② 대상·포함분 ─────────────────────────────────────────────────────────

def remote_tags():
    """원격이 진실 — 로컬 태그는 다른 세션이 낸 번호를 모른다."""
    out = {}
    for line in git('ls-remote', '--tags', PUSH_URL, 'v*').splitlines():
        sha, ref = line.split('\t')
        name = ref.removeprefix('refs/tags/')
        if name.endswith('^{}'):
            out[name[:-3]] = sha          # annotated 태그가 가리키는 커밋
        else:
            out.setdefault(name, sha)
    return {k: v for k, v in out.items() if SEMVER.match(k)}


def ver(tag):
    return tuple(int(x) for x in SEMVER.match(tag).groups())


def tag_triggered_workflows(sha):
    """target 의 워크플로 중 v*.*.* 태그로 도는 것과 그 paths."""
    flows = {}
    for name in git('ls-tree', '--name-only', f'{sha}:.github/workflows').splitlines():
        text = git('show', f'{sha}:.github/workflows/{name}')
        on = json.loads(subprocess.run(['yq', '-o=json', '.on'], input=text, capture_output=True, text=True).stdout or 'null')
        push = (on or {}).get('push') if isinstance(on, dict) else None
        if isinstance(push, dict) and any('v*' in t for t in push.get('tags', [])):
            flows[name] = [p.rstrip('*').rstrip('/') for p in push.get('paths', [])]
    return flows


def changed(base, target, paths):
    return bool(git('diff', '--name-only', f'{base}..{target}', '--', *paths))


def decide_bump(base, target):
    subjects = git('log', '--format=%s', f'{base}..{target}', '--', *WEB_PATHS).splitlines()
    if any(re.match(r'^feat(\(.+\))?!?:', s) for s in subjects):
        return 'minor', subjects
    return 'patch', subjects


def next_version(latest, bump):
    major, minor, patch = ver(latest)
    if bump == 'major':
        return f'v{major + 1}.0.0'
    if bump == 'minor':
        return f'v{major}.{minor + 1}.0'
    return f'v{major}.{minor}.{patch + 1}'


def summarize(subjects):
    picked = [re.sub(r'^(feat|fix)(\(.+?\))?!?:\s*', '', s) for s in subjects if re.match(r'^(feat|fix)\b', s)]
    return ' · '.join(picked[:3]) or f'변경 {len(subjects)}건'


# ── ④ 빌드 관문 ────────────────────────────────────────────────────────────

def build_gate(target, timeout=1800):
    """deploy-web-staging 은 main 푸시마다 같은 빌드(pnpm turbo build --filter=web...)를 돈다 → 그 성공이 커밋분 빌드 증거."""
    deadline = time.time() + timeout
    waited = False
    while True:
        runs = json.loads(gh('run', 'list', '-R', REPO, '--workflow', 'deploy-web-staging.yml', '--branch', 'main',
                             '--limit', '30', '--json', 'headSha,status,conclusion,databaseId'))
        exact = [r for r in runs if r['headSha'] == target]
        ok = [r for r in exact if r['conclusion'] == 'success']
        if ok:
            log(f'✅ ④ 빌드  deploy-web-staging #{ok[0]["databaseId"]} 성공 @ {target[:8]}')
            return
        if any(r['status'] != 'completed' for r in exact):
            if not waited:
                log(f'⏳ ④ 빌드  {target[:8]} 스테이징 빌드 진행 중 — 대기')
                waited = True
            if time.time() > deadline:
                die('④ 빌드  스테이징 빌드 대기 초과')
            time.sleep(30)
            continue
        broken = [r for r in exact if r['conclusion'] not in ('cancelled', 'skipped')]
        if broken:
            die(f'④ 빌드  deploy-web-staging #{broken[0]["databaseId"]} {broken[0]["conclusion"]} @ {target[:8]} — 이 커밋은 빌드가 깨져 있다')
        # 그 커밋 런이 없거나(웹 무관 커밋·대기열 교체) 취소됐으면, 웹 입력이 같은 더 이른 성공 런을 증거로 쓴다.
        for r in runs:
            if r['conclusion'] == 'success' and is_ancestor(r['headSha'], target) and not changed(r['headSha'], target, WEB_PATHS):
                log(f'✅ ④ 빌드  deploy-web-staging #{r["databaseId"]} 성공 @ {r["headSha"][:8]} (그 뒤 웹 입력 변경 없음)')
                return
        die(f'④ 빌드  {target[:8]} 의 스테이징 빌드 성공 증거가 없음 — '
            f'`gh workflow run deploy-web-staging.yml -R {REPO}` 로 돌린 뒤 다시')


# ── ⑤ GraphQL 관문 ─────────────────────────────────────────────────────────

def introspection_key():
    # 운영 API 는 키 헤더가 있어야 스키마를 내준다(scripts/introspection_key.py). 한 번만 읽는다.
    global _INTROSPECTION_KEY
    if _INTROSPECTION_KEY is None:
        sys.path.insert(0, HERE)
        import introspection_key as ik
        _INTROSPECTION_KEY = ik.introspection_key()
    return _INTROSPECTION_KEY


_INTROSPECTION_KEY = None


def gql_errors(sha, work):
    root = os.path.join(work, sha[:12])
    os.makedirs(root, exist_ok=True)
    srcs = [p for p in ('apps/web/src', 'apps/admin/src') if git('ls-tree', '-d', sha, p, check=False)]
    archive = subprocess.run(['git', 'archive', sha, *srcs], cwd=TOP, capture_output=True, check=True).stdout
    subprocess.run(['tar', '-x', '-C', root], input=archive, check=True)
    p = subprocess.run(['node', os.path.join(HERE, 'gql-check.mjs'), '--schema', PROD_SCHEMA, '--root', root, *srcs],
                       capture_output=True, text=True, env={**os.environ, 'GRAPHQL_INTROSPECTION_KEY': introspection_key()})
    if p.returncode != 0:
        die(f'⑤ GraphQL  검사 실행 실패: {p.stderr.strip()[:400]}', 2)
    return json.loads(p.stdout)


def ensure_gql_lib():
    if not os.path.exists(os.path.join(CACHE, 'node_modules/graphql/package.json')):
        lock = git('show', 'HEAD:pnpm-lock.yaml')
        m = re.search(r'\bgraphql@(16\.\d+\.\d+)', lock)
        sh('npm', 'i', '-s', '--no-audit', '--no-fund', '--prefix', CACHE, f'graphql@{m.group(1) if m else "16.14.2"}')


def gql_gate(base, target):
    ensure_gql_lib()
    work = tempfile.mkdtemp(prefix='release-tag-gql-')
    try:
        after = gql_errors(target, work)
        before = gql_errors(base, work)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    key = lambda e: (e['file'], e['op'], e['message'])  # noqa: E731
    new = [e for e in after['errors'] if key(e) not in {key(x) for x in before['errors']}]
    if new:
        lines = '\n'.join(f'   {e["file"]} {e["op"]}: {e["message"]}' for e in new[:15])
        die(f'⑤ GraphQL  운영 스키마({PROD_SCHEMA})에 없는 필드·인자를 새로 쓴다 — 서버 운영 롤아웃 먼저:\n{lines}')
    log(f'✅ ⑤ GraphQL  문서 {after["checked"]}개 운영 스키마 통과'
        + (f' (기존 오류 {len(after["errors"])}건은 직전 태그에도 있음)' if after['errors'] else '')
        + (f', 동적 문서 {after["skipped"]}개는 검사 밖' if after['skipped'] else ''))


# ── ⑥ 태그 · ⑦ 배포 확인 ───────────────────────────────────────────────────

def push_tag(target, bump, summary, dry_run):
    for attempt in range(3):
        tags = remote_tags()
        latest = max(tags, key=ver)
        version = next_version(latest, bump)
        msg = f'{version} — {summary}'
        if dry_run:
            log(f'🧪 ⑥ 태그  (dry-run) {msg} @ {target[:8]} — 직전 최고 번호 {latest}')
            return version
        git('tag', '-a', version, target, '-m', msg)
        p = subprocess.run(['git', 'push', PUSH_URL, f'refs/tags/{version}'], cwd=TOP, capture_output=True, text=True)
        if p.returncode == 0:
            log(f'✅ ⑥ 태그  {msg} @ {target[:8]} push')
            return version
        git('tag', '-d', version)
        if 'already exists' in p.stderr or 'rejected' in p.stderr:
            log(f'↻  ⑥ 태그  {version} 를 다른 세션이 먼저 냈다 — 번호 다시 계산')
            continue
        die(f'⑥ 태그  push 실패: {p.stderr.strip()[:300]}', 2)
    die('⑥ 태그  번호 경합 3회 — 잠시 뒤 다시', 2)


def wait_deploy(version, target, timeout=2700):
    deadline = time.time() + timeout
    seen = None
    while time.time() < deadline:
        runs = json.loads(gh('run', 'list', '-R', REPO, '--workflow', 'deploy-web-prod.yml', '--limit', '15',
                             '--json', 'databaseId,headBranch,status,conclusion,event'))
        mine = [r for r in runs if r['headBranch'] == version]
        if mine:
            r = mine[0]
            if seen != r['status']:
                log(f'⏳ ⑦ 배포  deploy-web-prod #{r["databaseId"]} {r["status"]}')
                seen = r['status']
            if r['status'] == 'completed':
                if r['conclusion'] == 'success':
                    return version
                if r['conclusion'] == 'cancelled':
                    # 대기 중인 배포는 뒤 태그가 오면 취소된다(10-09) — 뒤 태그가 이 커밋을 포함하면 그쪽이 나간다.
                    later = [t for t, sha in remote_tags().items() if ver(t) > ver(version) and is_ancestor(target, sha)]
                    if later:
                        nxt = min(later, key=ver)
                        log(f'↪  ⑦ 배포  취소됨 — 뒤 태그 {nxt} 가 이 커밋을 포함, 그 배포를 확인')
                        return wait_deploy(nxt, target, int(deadline - time.time()))
                die(f'⑦ 배포  deploy-web-prod #{r["databaseId"]} {r["conclusion"]} — `gh run view {r["databaseId"]} -R {REPO} --log-failed`')
        time.sleep(30)
    die('⑦ 배포  deploy-web-prod 대기 초과')


def deploy_verify(version):
    """gitops 의 판정 스크립트를 origin/main 판으로 돌린다(로컬 체크아웃이 뒤처져 있어도)."""
    if not os.path.isdir(GITOPS):
        die(f'⑦ 배포  gitops 체크아웃 없음({GITOPS}) — JIRUM_GITOPS 로 지정', 2)
    sh('git', 'fetch', '-q', 'origin', 'main', cwd=GITOPS)
    code = sh('git', 'show', 'origin/main:scripts/deploy-verify.py', cwd=GITOPS)
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False) as f:
        f.write(code)
    try:
        p = subprocess.run([sys.executable, f.name, 'frontend-web', '--expect', version],
                           env={**os.environ, 'GITOPS_ROOT': GITOPS})
    finally:
        os.unlink(f.name)
    if p.returncode != 0:
        die(f'⑦ 배포  deploy-verify 실패 — 운영 롤백은 gitops apps/frontend-web/overlays/production newTag 를 직전 정상 태그로', p.returncode)


def seo_check():
    """⑧ 크롤러 눈 — 실패는 1분 뒤 한 번 더 재서 그때도 실패일 때만(파드 교체 중 오경보 방지). 사이트맵·RSS 날짜는 이 배포 탓이 아니라 경고만."""
    p = subprocess.run([sys.executable, os.path.join(HERE, 'seo-check.py'), '--deploy', '--retry-wait', '60'], cwd=TOP)
    if p.returncode == 1:
        die('⑧ SEO  봇이 받는 운영 HTML 이 깨졌다(위 ❌) — 이 배포 탓이면 gitops apps/frontend-web/overlays/production newTag 를 직전 정상 태그로')
    if p.returncode != 0:
        log('⚠️  ⑧ SEO  점검을 못 돌렸다(사이트에 닿지 않음) — 배포 판정은 ⑦ 로 끝났다')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--sha', default='origin/main', help='태그할 커밋(기본 origin/main)')
    ap.add_argument('--bump', choices=['major', 'minor', 'patch'], help='기본: 포함 커밋에 feat 가 있으면 minor, 아니면 patch')
    ap.add_argument('--summary', help='태그 메시지 요약(기본: feat/fix 제목 3개)')
    ap.add_argument('--dry-run', action='store_true', help='관문까지만 보고 태그하지 않는다')
    ap.add_argument('--no-wait', action='store_true', help='태그 push 뒤 배포 확인을 하지 않는다')
    ap.add_argument('--skip-build-gate', action='store_true')
    ap.add_argument('--skip-gql-gate', action='store_true')
    a = ap.parse_args()

    if 'jirum-alarm-frontend' not in git('remote', 'get-url', 'origin'):
        die('jirum-alarm-frontend 레포에서 실행', 2)
    with Lock():
        git('fetch', '-q', 'origin', 'main')
        target = git('rev-parse', f'{a.sha}^{{commit}}')
        if not is_ancestor(target, 'origin/main'):
            die(f'① 대상  {target[:8]} 이 origin/main 에 없다 — push 가 먼저(고아 태그 방지)')
        tags = remote_tags()
        latest = max(tags, key=ver)
        if is_ancestor(target, tags[latest]):
            log(f'✅ 이미 {latest} 에 포함된 커밋 — 할 일 없음')
            return
        reachable = sorted((t for t, sha in tags.items() if is_ancestor(sha, target)), key=ver, reverse=True)
        if not reachable:
            die('① 대상  조상인 릴리스 태그가 없다', 2)
        base = reachable[0]
        log(f'✅ ① 대상  {target[:8]} (origin/main 포함) · 직전 태그 {base}' + (f' · 최고 번호 {latest}' if latest != base else ''))
        if latest != base:
            log(f'⚠️  최고 번호 {latest} 가 이 커밋의 조상이 아니다(고아 태그일 수 있음) — 번호만 그 위로 잇는다')

        stat = git('diff', '--stat', f'{tags[base]}..{target}', '--', *WEB_PATHS)
        if not stat:
            log(f'✅ {base} 이후 apps/web·packages 변경 없음 — 웹 태그 불필요')
            return
        log(f'── ② 포함분 ({base}..{target[:8]} -- {" ".join(WEB_PATHS)})\n{stat}')
        flows = tag_triggered_workflows(target)
        firing = [n for n, paths in flows.items() if not paths or changed(tags[base], target, paths)]
        log(f'✅ ② 함께 나가는 배포: {", ".join(firing) or "없음"}')

        bump, subjects = decide_bump(tags[base], target)
        bump = a.bump or bump
        summary = a.summary or summarize(subjects)
        log(f'✅ ③ 버전  {bump} (커밋 {len(subjects)}개' + (', feat 포함' if bump == 'minor' else '') + ')')

        if a.skip_build_gate:
            log('⚠️  ④ 빌드  건너뜀(--skip-build-gate)')
        else:
            build_gate(target)
        if a.skip_gql_gate:
            log('⚠️  ⑤ GraphQL  건너뜀(--skip-gql-gate)')
        else:
            gql_gate(tags[base], target)

        version = push_tag(target, bump, summary, a.dry_run)
    if a.dry_run or a.no_wait:
        return
    deployed = wait_deploy(version, target)
    log(f'✅ ⑦ 배포  deploy-web-prod {deployed} 성공 → 운영 판정')
    deploy_verify(deployed)
    seo_check()
    log(f'RELEASE-TAG DONE {deployed} @ {target[:8]}')


if __name__ == '__main__':
    main()
