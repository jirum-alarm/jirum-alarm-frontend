#!/usr/bin/env python3
# 앱 화면 하네스의 그림 판정 — screens-ios.sh·screens-android.sh 가 같이 쓴다(판정을 바꾸면 두 플랫폼이 함께 바뀐다).
#
#   python3 screens-judge.py <out> "<화면> <딥링크>"…      (env FATAL_LOG = 치명 예외 로그 파일, SCREENS_TITLE = 리포트 제목)
#   <out>/<light|dark>/<화면>.bmp 를 읽는다 — 64px 폭으로 줄인 BMP(맥 sips·리눅스 ImageMagick). 표준 파이썬만 써서 러너에 PIL 이 없어도 돈다.
#   → <out>/report.md, 실패가 있으면 exit 1.
# 판정(❌): 캡처 없음(앱 종료) · 거의 한 색(빈 화면) · 홈과 거의 같은 그림(딥링크가 못 감) · 치명 예외.
# 보고(⚠️): 다크인데 밝은 면이 대부분 · 라이트와 다크가 거의 같음.
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

lines = [f"# {os.environ.get('SCREENS_TITLE', '앱 화면 하네스 결과')}", '', '| 화면 | 라이트 | 다크 | 문제 |', '|---|---|---|---|']
failed = False
home = {}
same_as_home = 0
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
            same_as_home += 1
            failed = True
    if len(got) == 2:
        diff = changed(got['light'][0], got['dark'][0])
        if diff < 0.2:
            issues.append(f'⚠️ 라이트·다크가 거의 같다(다른 픽셀 {diff:.0%}) — 다크 미적용')
    dark = '—' if name == 'first-launch' else f'`dark/{name}.png`'
    lines.append(f'| {name} | `light/{name}.png` | {dark} | {"<br>".join(issues) or "—"} |')
# 거의 전부(3/4 이상) 홈과 같으면 딥링크 하나하나가 아니라 앱이 메인 전(로그인 첫 화면)에서 멈춘 것이다. 첫 실행의 게스트 생성은
# 운영 API 쓰기라, 점검(읽기 전용)·장애 중이면 모든 화면이 로그인 화면으로 찍힌다(10/20 운영 점검 중 실측).
if same_as_home and same_as_home >= 0.75 * 2 * (len(names) - 2):
    lines[1:1] = ['', '❌ **거의 모든 화면이 홈과 같다 — 앱이 메인 전에서 멈췄다.** `light/home.png` 가 로그인 첫 화면이면 게스트 생성'
                  '(운영 API 쓰기) 실패다 — API 점검·장애 시간인지부터 보고, 끝난 뒤 이 잡을 다시 돌린다.']
fatal_log = os.environ.get('FATAL_LOG', '')
fatal = open(fatal_log).read().strip() if fatal_log and os.path.exists(fatal_log) else ''
if fatal:
    lines += ['', '## ❌ 치명 JS 예외', '```', fatal[:1500], '```']
open(os.path.join(out, 'report.md'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
sys.exit(1 if failed else 0)
