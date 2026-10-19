#!/usr/bin/env python3
"""크롤러 눈 점검 — 운영 HTML 을 검색 봇 UA 로 받아, 색인을 조용히 죽이는 회귀를 잡는다.

왜: «코드에 있다»와 «봇이 받은 HTML 에 있다»는 다르다. 실제로 데스크톱 분기에만 h1 이 없었고(2달, 09-02 발견),
dev 배포가 index 로 열려 있었고(09-03), 모델 페이지 링크가 클라이언트에서만 그려졌고(09-03), 첫 방문 시트가
봇 렌더를 덮었다(10-16). 전부 사람이 우연히 찾았다. 배포마다 대표 페이지를 봇 UA 로 받아 보면 그날 안에 잡힌다.

  python3 scripts/seo-check.py                      # 운영 전체(매일 감시와 같은 판정)
  python3 scripts/seo-check.py --deploy --retry-wait 60   # 배포 직후(release-tag.py ⑧) — 데이터 신선도는 경고로만
  python3 scripts/seo-check.py --base http://localhost:3111 --site https://jirum-alarm.com --pages-only   # 로컬 빌드

페이지 유형(홈·새 상품·모델·키워드 허브·허브 목록·랭킹·토스·도움말·가이드) × UA(구글 데스크톱·구글 스마트폰·네이버 Yeti):
  상태 200(리다이렉트 없이) · noindex 없음(meta·X-Robots-Tag) · canonical = 자기 주소 · h1 정확히 1개 · title(홈과 다름)·description ·
  JSON-LD 전부 파싱 + 유형별 필수 @type + @id 참조가 같은 페이지 안에서 풀림 · 본문 글자 수 하한(CSR 로 떨어지면 수백 자로 준다)
사이트: robots.txt(주요 봇이 상품·허브를 받을 수 있나·Sitemap 줄) · 사이트맵·RSS 는 값이 아니라 날짜를 본다(배치가 멈춰도 파일은 200) ·
  없는 상품·없는 주소 = 404 · http·www → apex 301 한 번

본문·h1 은 Next 스트리밍 조각(`<div hidden id="S:n">`, 인라인 스크립트가 제자리에 끼운다)까지 센다. 상세의 새 딜 링크·랭킹 목록은
9월부터 내내 그 조각 안에 있었고 그 사이 구글·네이버가 새 딜을 찾아 왔다(2026-10-19 웹 아카이브 대조) — JS 를 돌리는 봇에겐 보이는 글자다.
그 밖의 hidden(닫힌 패널 등)은 안 보이는 글자로 친다.

실행 주체: release-tag.py ⑧(운영 배포 직후) + .github/workflows/seo-check.yml(매일, 실패 시 Mattermost).
기준값은 2026-10-19 운영 실측에서 잡았다(본문 하한은 실측의 절반 아래). 페이지를 의도적으로 바꿨으면 REQUIRED·MIN_TEXT 를 같이 고친다.
exit 0 = 통과(경고 허용), 1 = 실패 있음, 2 = 환경 오류(사이트에 닿지 않음).
"""
import argparse
import datetime as dt
import email.utils
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from html.parser import HTMLParser

UAS = {
    'google': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; '
              '+http://www.google.com/bot.html) Chrome/141.0.0.0 Safari/537.36',
    'google-mobile': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) '
                     'Chrome/141.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'yeti': 'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
}
# 유형별로 빠지면 안 되는 JSON-LD @type. WebSite·Organization 은 레이아웃이 모든 페이지에 싣는다.
SITE_LD = {'WebSite', 'Organization'}
REQUIRED = {
    'home': SITE_LD,
    'product': SITE_LD | {'Product', 'ItemPage', 'BreadcrumbList'},
    'model': SITE_LD | {'Product', 'BreadcrumbList'},
    'keyword': SITE_LD | {'ItemList', 'FAQPage', 'BreadcrumbList'},
    'deals': SITE_LD | {'ItemList'},
    'keywords': SITE_LD,
    'ranking': SITE_LD | {'ItemList'},
    'toss': SITE_LD | {'ItemList'},
    'help': SITE_LD | {'FAQPage'},
    'guide': SITE_LD | {'HowTo'},
}
# 본문 글자 수 하한(머리·바닥 글자 ~250자 포함). 10/19 실측 최저의 절반 안팎 — 본문이 빠지면 머리·바닥만 남아 여기 아래로 떨어진다.
MIN_TEXT = {
    'home': 2000, 'product': 600, 'model': 500, 'keyword': 1500, 'deals': 5000, 'keywords': 1500,
    'ranking': 1500, 'toss': 500, 'help': 1500, 'guide': 500,
}
# 정본 주소. 랭킹은 탭 0 이 정본이다(탭 12+ 도 여기로 canonical, v1.28.1).
PAGES = [
    ('home', '/'), ('deals', '/deals'), ('keywords', '/keywords'), ('ranking', '/trending/ranking?tab=0'),
    ('toss', '/toss'), ('help', '/help'), ('guide', '/guide/hotdeal-alarm'),
]
SKIP_TAGS = {'script', 'style', 'noscript', 'template', 'svg'}
VOID_TAGS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
STREAMED_CHUNK = re.compile(r'^S:\d+$')


class Page(HTMLParser):
    """title·meta·canonical·h1·JSON-LD·본문 글자를 한 번에 모은다."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.meta, self.canonical = '', {}, []
        self.h1, self.ld, self.text = [], [], []
        self.streamed_chars = 0
        self._stack = []  # (tag, skip, hidden, streamed)
        self._h1 = None
        self._ld = None
        self._in_title = False

    def _flags(self):
        return (any(e[1] for e in self._stack), any(e[2] for e in self._stack), any(e[3] for e in self._stack))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            key = (a.get('name') or a.get('property') or '').lower()
            if key:
                self.meta.setdefault(key, []).append(a.get('content') or '')
        elif tag == 'link' and 'canonical' in (a.get('rel') or '').lower().split():
            self.canonical.append(a.get('href') or '')
        elif tag == 'title' and not self.title:
            self._in_title = True
        if tag in VOID_TAGS:
            return
        if tag == 'script' and (a.get('type') or '').lower() == 'application/ld+json':
            self._ld = []
        streamed = tag == 'div' and 'hidden' in a and bool(STREAMED_CHUNK.match(a.get('id') or ''))
        self._stack.append((tag, tag in SKIP_TAGS, 'hidden' in a and not streamed, streamed))
        if tag == 'h1':
            self._h1 = []

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False
        if tag == 'script' and self._ld is not None:
            self.ld.append(''.join(self._ld))
            self._ld = None
        if tag == 'h1' and self._h1 is not None:
            if not self._flags()[1]:
                self.h1.append(' '.join(''.join(self._h1).split()))
            self._h1 = None
        # 닫는 태그가 빠진 HTML 에도 스택이 어긋나지 않게 가장 가까운 같은 태그까지 닫는다.
        for i in range(len(self._stack) - 1, -1, -1):
            if self._stack[i][0] == tag:
                del self._stack[i:]
                break

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._ld is not None:
            self._ld.append(data)
            return
        skip, hidden, streamed = self._flags()
        if skip or hidden:
            return
        if self._h1 is not None:
            self._h1.append(data)
        self.text.append(data)
        if streamed:
            self.streamed_chars += len(data.strip())


class Fetch:
    def __init__(self, status, headers, body, location):
        self.status, self.headers, self.body, self.location = status, headers, body, location


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


_OPENER = urllib.request.build_opener(_NoRedirect)


def fetch(url, ua, tries=3):
    """리다이렉트는 따라가지 않는다 — 정본 주소가 301 을 타면 그 자체가 결함이다. 네트워크 오류·5xx 는 두 번 더 시도."""
    last = None
    url = urllib.parse.quote(url, safe=':/?&=%#')  # 한글 슬러그(/keywords/삼다수)는 인코딩해서 보낸다
    for i in range(tries):
        req = urllib.request.Request(url, headers={'User-Agent': ua, 'Accept-Language': 'ko-KR,ko;q=0.9'})
        try:
            r = _OPENER.open(req, timeout=30)
            return Fetch(r.status, r.headers, r.read().decode('utf-8', 'replace'), None)
        except urllib.error.HTTPError as e:
            if e.code >= 500 and i < tries - 1:
                last = e
                time.sleep(3)
                continue
            return Fetch(e.code, e.headers, e.read().decode('utf-8', 'replace'), e.headers.get('Location'))
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = e
            time.sleep(3)
    raise ConnectionError(f'{url}: {last}')


def ld_graph(blocks):
    """JSON-LD 블록들의 @type 집합 · 선언된 @id · 참조만 하는 @id · 파싱 실패 블록 수.
    블록 하나가 깨지면 그 블록 전체가 무시되고, 참조할 대상이 페이지에 없으면 엔티티가 끊긴다."""
    types, declared, refs, broken = set(), set(), set(), 0

    def walk(node):
        if isinstance(node, list):
            for n in node:
                walk(n)
        elif isinstance(node, dict):
            t = node.get('@type')
            for x in (t if isinstance(t, list) else [t]):
                if isinstance(x, str):
                    types.add(x)
            if isinstance(node.get('@id'), str):
                (refs if set(node) <= {'@id', '@context'} else declared).add(node['@id'])
            for k, v in node.items():
                if k not in ('@id', '@type', '@context'):
                    walk(v)

    for b in blocks:
        try:
            walk(json.loads(b))
        except ValueError:
            broken += 1
    return types, declared, refs, broken


def norm_url(u):
    """canonical 비교용 — 퍼센트 인코딩·끝 슬래시 차이는 같은 주소로 본다."""
    p = urllib.parse.urlsplit(urllib.parse.unquote(u.strip()))
    return f'{p.scheme}://{p.netloc}{p.path.rstrip("/")}' + (f'?{p.query}' if p.query else '')


class Report:
    def __init__(self):
        self.rows = []

    def add(self, level, where, msg):
        self.rows.append((level, where, msg))

    @property
    def failed(self):
        return any(level == 'FAIL' for level, _, _ in self.rows)


def check_page(rep, ctx, kind, path, ua_name):
    where = f'{kind} {path} [{ua_name}]'
    r = fetch(ctx['base'] + path, UAS[ua_name])
    if r.status != 200:
        rep.add('FAIL', where, f'상태 {r.status}' + (f' → {r.location}' if r.location else ''))
        return
    p = Page()
    p.feed(r.body)
    problems = []
    xrt = (r.headers.get('X-Robots-Tag') or '').lower()
    robots = ' '.join(p.meta.get('robots', []) + p.meta.get('googlebot', []) + p.meta.get('yeti', [])).lower()
    if 'noindex' in xrt or 'noindex' in robots:
        problems.append(f'noindex (meta="{robots}" header="{xrt}")')
    if len(p.canonical) != 1:
        problems.append(f'canonical {len(p.canonical)}개')
    elif norm_url(p.canonical[0]) != norm_url(ctx['site'] + path):
        problems.append(f'canonical 이 다른 주소 → {p.canonical[0]}')
    h1 = [t for t in p.h1 if t]
    if len(h1) != 1:
        problems.append(f'h1 {len(h1)}개 {[t[:30] for t in h1]}')
    title = ' '.join(html.unescape(p.title).split())
    if kind == 'home':
        ctx['home_title'] = title
    if len(title) < 5:
        problems.append('title 없음')
    elif kind != 'home' and title == ctx.get('home_title'):
        problems.append('title 이 홈과 같다(메타 폴백)')
    if not (p.meta.get('description') or [''])[0].strip():
        problems.append('description 없음')
    types, declared, refs, broken = ld_graph(p.ld)
    if broken:
        problems.append(f'JSON-LD 파싱 실패 {broken}블록')
    missing = REQUIRED[kind] - types
    if missing:
        problems.append(f'JSON-LD 빠짐 {sorted(missing)}')
    dangling = refs - declared
    if dangling:
        problems.append(f'JSON-LD @id 참조가 페이지에 없음 {sorted(dangling)}')
    text_len = len(' '.join(' '.join(p.text).split()))
    if text_len < MIN_TEXT[kind]:
        problems.append(f'본문 {text_len}자 < 하한 {MIN_TEXT[kind]}(CSR 로 떨어졌나)')
    page_types = sorted(t for t in types if any(t in req for req in REQUIRED.values()) and t not in SITE_LD)
    summary = f'h1="{h1[0][:24] if h1 else "-"}" 본문 {text_len}자(스트리밍 {p.streamed_chars}) LD {page_types}'
    rep.add('FAIL' if problems else 'OK', where, ' · '.join(problems + [summary]) if problems else summary)


def discover(rep, ctx):
    """표본 주소 — 고정 id 는 상품이 내려가면 거짓 경보가 되니 매번 RSS·허브·사이트맵에서 고른다."""
    base, ua = ctx['base'], UAS['google']
    found = {}
    rss = fetch(base + '/rss.xml', ua)
    for pid in re.findall(r'<link>[^<]*/products/(\d+)</link>', rss.body if rss.status == 200 else '')[:5]:
        # 막 올라온 딜이 그새 내려갔을 수 있다 — 200 인 첫 상품을 쓴다.
        if fetch(f'{base}/products/{pid}', ua).status == 200:
            found['product'] = f'/products/{pid}'
            break
    deals = fetch(base + '/deals', ua)
    m = re.search(r'href="(/deals/[^"/?#]+)"', deals.body) if deals.status == 200 else None
    if m:
        found['model'] = html.unescape(m.group(1))
    kw = fetch(base + '/keywords/sitemap.xml', ua)
    m = re.search(r'<loc>[^<]*?(/keywords/[^<]+)</loc>', kw.body) if kw.status == 200 else None
    if m:
        found['keyword'] = urllib.parse.unquote(m.group(1))
    for kind in ('product', 'model', 'keyword'):
        if kind not in found:
            rep.add('FAIL', kind, '표본 주소를 못 찾았다(RSS·/deals·키워드 사이트맵)')
    return found


def check_freshness(rep, ctx, where, label, newest, limit_hours):
    """값이 아니라 값의 날짜 — 생성 배치가 멈춰도 파일은 계속 200 이다. 배포 판정에선 이 배포 탓이 아니니 경고로만."""
    hours = (dt.datetime.now(dt.timezone.utc) - newest).total_seconds() / 3600
    level = 'OK' if hours <= limit_hours else ('WARN' if ctx['deploy'] else 'FAIL')
    rep.add(level, where, f'{label} · 최신 {hours:.1f}시간 전' + ('' if level == 'OK' else f'(> {limit_hours}시간)'))


def check_sitemap(rep, ctx, url, ua):
    r = fetch(url, ua)
    name = urllib.parse.urlsplit(url).path
    if r.status != 200:
        rep.add('FAIL', 'sitemap', f'{name} 상태 {r.status}')
        return
    locs = re.findall(r'<loc>([^<]+)</loc>', r.body)
    dates = []
    for m in re.findall(r'<lastmod>([^<]+)</lastmod>', r.body):
        try:
            d = dt.datetime.fromisoformat(m.strip().replace('Z', '+00:00'))
        except ValueError:
            continue
        dates.append(d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc))
    if not locs:
        rep.add('FAIL', 'sitemap', f'{name} 주소 0개')
    elif not dates:
        rep.add('WARN', 'sitemap', f'{name} 주소 {len(locs)}개 · lastmod 없음')
    else:
        # 최근 인덱스는 15분 배치, 전체 인덱스는 하루 배치, 키워드는 마지막 딜 시각 — 이틀이면 셋 다 멈춘 것이다.
        check_freshness(rep, ctx, 'sitemap', f'{name} 주소 {len(locs)}개', max(dates), 48)


def check_site(rep, ctx):
    base, ua = ctx['base'], UAS['google']
    r = fetch(base + '/robots.txt', ua)
    if r.status != 200:
        rep.add('FAIL', 'robots.txt', f'상태 {r.status}')
    else:
        rp = urllib.robotparser.RobotFileParser()
        rp.parse(r.body.splitlines())
        samples = ['/', '/products/1', '/deals/x', '/keywords/x', '/trending/ranking']
        blocked = [f'{bot} {p}' for bot in ('Googlebot', 'Yeti', 'bingbot', 'Daum', 'OAI-SearchBot', 'ChatGPT-User')
                   for p in samples if not rp.can_fetch(bot, ctx['site'] + p)]
        maps = rp.site_maps() or []
        if blocked:
            rep.add('FAIL', 'robots.txt', f'막힘: {", ".join(blocked[:6])}')
        elif not maps:
            rep.add('FAIL', 'robots.txt', 'Sitemap 줄 없음')
        else:
            rep.add('OK', 'robots.txt', f'주요 봇 6종 허용 · Sitemap {len(maps)}줄')
        for sm in maps:
            check_sitemap(rep, ctx, sm, ua)
    rss = fetch(base + '/rss.xml', ua)
    dates = [email.utils.parsedate_to_datetime(d) for d in re.findall(r'<pubDate>([^<]+)</pubDate>', rss.body)]
    if rss.status != 200 or not dates:
        rep.add('FAIL', 'rss', f'/rss.xml 상태 {rss.status} · 항목 {len(dates)}개')
    else:
        # 커뮤니티 딜이 하루 ~900건이라 반나절 동안 새 항목이 없으면 수집이나 피드가 멈춘 것이다.
        check_freshness(rep, ctx, 'rss', f'항목 {len(dates)}개', max(dates), 12)
    llms = fetch(base + '/llms.txt', ua)
    rep.add('OK' if llms.status == 200 and len(llms.body) > 200 else 'FAIL', 'llms.txt', f'상태 {llms.status} · {len(llms.body)}B')
    for p in ('/products/999999999', '/seo-check-not-a-page'):
        nf = fetch(base + p, ua)
        rep.add('OK' if nf.status == 404 else 'FAIL', '404', f'{p} → {nf.status}')
    host = urllib.parse.urlsplit(base).netloc
    for src in (f'http://{host}/', f'https://www.{host}/'):
        hop = fetch(src, ua)
        good = hop.status in (301, 308) and norm_url(hop.location or '') == norm_url(base + '/')
        rep.add('OK' if good else 'FAIL', 'redirect', f'{src} → {hop.status} {hop.location or ""}')


def run(a):
    ctx = {'base': a.base.rstrip('/'), 'site': (a.site or a.base).rstrip('/'), 'deploy': a.deploy}
    rep = Report()
    if not a.pages_only:
        check_site(rep, ctx)
    found = discover(rep, ctx)
    for kind, path in PAGES + [(k, found[k]) for k in ('product', 'model', 'keyword') if k in found]:
        for ua_name in UAS:
            check_page(rep, ctx, kind, path, ua_name)
    return rep


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--base', default='https://jirum-alarm.com', help='받아 올 주소')
    ap.add_argument('--site', help='canonical 이 가리켜야 할 정본 주소(기본 = --base). 로컬 빌드를 잴 때 운영 주소로')
    ap.add_argument('--deploy', action='store_true', help='배포 직후 판정 — 사이트맵·RSS 날짜는 이 배포와 무관하니 경고로만')
    ap.add_argument('--pages-only', action='store_true', help='robots·사이트맵·404·리다이렉트 같은 사이트 점검을 건너뛴다(로컬 빌드용)')
    ap.add_argument('--retry-wait', type=int, default=0,
                    help='실패하면 N초 뒤 한 번 더 재서 그때도 실패일 때만 실패로(배포 직후 파드 교체 중 오경보 방지)')
    a = ap.parse_args()
    try:
        rep = run(a)
        if rep.failed and a.retry_wait:
            print(f'… 실패 {sum(lv == "FAIL" for lv, _, _ in rep.rows)}건 — {a.retry_wait}초 뒤 다시 잰다', flush=True)
            time.sleep(a.retry_wait)
            rep = run(a)
    except ConnectionError as e:
        print(f'❌ 사이트에 닿지 않음: {e}')
        raise SystemExit(2)
    mark = {'OK': '✅', 'WARN': '⚠️ ', 'FAIL': '❌'}
    for level, where, msg in rep.rows:
        print(f'{mark[level]} {where}: {msg}')
    n = {lv: sum(level == lv for level, _, _ in rep.rows) for lv in mark}
    print(f'SEO-CHECK {"FAIL" if rep.failed else "PASS"} — 통과 {n["OK"]} · 경고 {n["WARN"]} · 실패 {n["FAIL"]} ({a.base})')
    raise SystemExit(1 if rep.failed else 0)


if __name__ == '__main__':
    main()
