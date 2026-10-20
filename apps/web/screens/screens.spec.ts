// 화면 하네스: 고정 데이터(fixtures)로 web 페이지를 그려 찍고, 찍은 화면을 checks.ts 로 점검한다.
// 결과 = screens/.out/<project>/<화면>.png(첫 화면)·.full.png(아래로 4화면) + report.md(요약 + 화면별 문제). AI 는 report.md → 문제 있는 png 순으로 본다.
//
// 실패(빨간불)로 막는 것: 페이지 JS 오류·오류 경계·녹화 안 된 쿼리·가로 넘침.
// 보고만 하는 것: 글자 겹침·접근성(대비 등) — 기존 화면에 남은 것이 있어 기준선을 잡은 뒤 막는다(report.md 맨 위 요약).
// 빈·에러 시나리오는 일부러 깨뜨린 데이터라 가로 넘침만 막는다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { expect, test } from '@playwright/test';

import { accessibility, errorBoundary, horizontalOverflow, textOverlap } from './checks';
import { PAGES } from './pages';
import { USER_TOKEN } from './user-fixtures';

const HERE = __dirname;
const OUT = join(HERE, '.out');
const FIXTURE = `http://localhost:${process.env.SCREENS_FIXTURE_PORT ?? 9090}`;
const RECORDING = process.env.SCREENS_MODE === 'record';

// 분석·광고·외부 SDK 는 막는다 — 화면과 무관하고 네트워크 따라 느려지거나 흔들린다. 이미지는 그대로 받는다.
const BLOCKED_HOSTS =
  /googletagmanager|google-analytics|clarity\.ms|sentry\.io|doubleclick|googlesyndication|kakao|firebase|facebook|channel\.io/;
const NOISE =
  /Failed to load resource|net::ERR_|Download the React DevTools|\[Fast Refresh\]|\[HMR\]/;

const scenarios = (states?: boolean) =>
  states && !RECORDING ? (['default', 'empty', 'error'] as const) : (['default'] as const);

for (const page of PAGES) {
  for (const scenario of scenarios(page.states)) {
    test(`${page.name}${scenario === 'default' ? '' : ` [${scenario}]`}`, async ({
      page: tab,
      context,
    }, info) => {
      const project = info.project.name; // mobile-light | mobile-dark | desktop-light | desktop-dark
      test.skip(project.startsWith('desktop') && !page.desktop, '모바일 전용 화면');
      // 빈·에러 상태는 모바일 라이트 한 벌만 — 레이아웃 분기는 default 가 본다.
      test.skip(
        scenario !== 'default' && project !== 'mobile-light',
        '상태 시나리오는 mobile-light 만',
      );

      await fetch(`${FIXTURE}/__scenario`, {
        method: 'POST',
        body: JSON.stringify({ name: scenario }),
      });
      await fetch(`${FIXTURE}/__missing/reset`, { method: 'POST' });

      // 브라우저 시계도 서버와 같은 «녹화 시각 + 지난 시간»으로(playwright.config 의 SCREENS_PIN_NOW).
      const pinNow = Number(process.env.SCREENS_PIN_NOW);
      if (pinNow > 0) {
        await context.clock.setSystemTime(
          Date.now() + (pinNow - Number(process.env.SCREENS_PIN_START)),
        );
      }
      if (page.auth === 'user') {
        await context.addCookies([
          { name: 'ACCESS_TOKEN', value: USER_TOKEN, url: info.project.use.baseURL! },
        ]);
      }
      if (project.endsWith('dark')) {
        await context.addCookies([
          { name: 'COLOR_SCHEME', value: 'dark', url: info.project.use.baseURL! },
        ]);
      }
      // 운영 빌드의 링크 미리 불러오기(RSC prefetch)도 막는다 — 화면에 보이는 상품 링크마다 그 상세를 서버에서 그려
      // 이 화면과 무관한 쿼리 수백 개(ProductInfo·CommunityPost…)가 녹화 대상이 됐다.
      await context.route('**/*', async (route) => {
        const req = route.request();
        const external =
          req.resourceType() !== 'image' && BLOCKED_HOSTS.test(new URL(req.url()).hostname);
        const prefetch = (await req.headerValue('next-router-prefetch')) !== null;
        return external || prefetch ? route.abort() : route.continue();
      });

      const errors: string[] = [];
      tab.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      tab.on('console', (m) => {
        if (m.type() === 'error' && !NOISE.test(m.text()))
          errors.push(`console: ${m.text().slice(0, 300)}`);
      });

      const res = await tab.goto(page.path, { waitUntil: 'domcontentloaded' });
      await tab.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
      // 지연 로드 이미지·스크롤 진입 섹션을 깨운다.
      await tab.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight && y < 6000; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo(0, 0);
      });
      await tab.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);
      // next dev 의 개발 표시(왼쪽 아래 N)·React Query 개발 도구 버튼(오른쪽 아래 둥근 아이콘 — 마지막 탭을 덮어 버그로 착각했다)은 화면이 아니다.
      await tab.addStyleTag({
        content: 'nextjs-portal,.tsqd-parent-container{display:none!important}',
      });

      // 두 장: 첫 화면(사용자가 처음 보는 그대로, 고정 헤더·탭바 포함) + 아래로 4화면(고정 요소는 숨김 —
      // 전체 캡처에선 고정 요소가 첫 화면 위치에 박혀 본문 한가운데 떠 보인다).
      const base = join(
        OUT,
        project,
        `${page.name}${scenario === 'default' ? '' : `.${scenario}`}`,
      );
      mkdirSync(dirname(base), { recursive: true });
      await tab.screenshot({ path: `${base}.png`, animations: 'disabled' });

      // 점검은 고정 요소를 숨기기 전에 — 숨긴 뒤 돌리면 GNB·탭바 링크가 axe 에 «이름 없음»으로 잡혔다.
      const missing = RECORDING
        ? []
        : ((await (await fetch(`${FIXTURE}/__missing`)).json()) as string[]);
      const overflow = await horizontalOverflow(tab);
      const overlap = await textOverlap(tab);
      const a11y = await accessibility(tab);
      const boundary = scenario === 'default' && (await errorBoundary(tab));

      const viewport = tab.viewportSize()!;
      const height = await tab.evaluate(() => {
        for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
          if (getComputedStyle(el).position === 'fixed') el.style.visibility = 'hidden';
        }
        return document.documentElement.scrollHeight;
      });
      await tab.screenshot({
        path: `${base}.full.png`,
        fullPage: true,
        animations: 'disabled',
        clip: { x: 0, y: 0, width: viewport.width, height: Math.min(height, viewport.height * 4) },
      });

      // 빈·에러 시나리오는 일부러 데이터를 깨뜨린 것 — 그 결과 생기는 콘솔 오류·추가 쿼리는 보고만 하고,
      // 막는 건 «화면이 무너졌나»(가로 넘침)뿐. 기본 시나리오는 전부 막는다.
      const strict = scenario === 'default' && !RECORDING; // 녹화는 데이터를 모으는 실행 — 판정은 재생에서.
      const mark = strict ? '❌' : '⚠️';
      const lines = [
        `### ${project} · ${page.name}${scenario === 'default' ? '' : ` [${scenario}]`} — \`${page.path}\``,
        `\`${project}/${base.split('/').pop()}.png\` · \`.full.png\` · status ${res?.status()}`,
        ...errors.map((e) => `- ${mark} JS 오류: ${e}`),
        ...(boundary ? ['- ❌ 오류 경계: 「서버에러가 발생했습니다」가 그려짐'] : []),
        ...missing.map((m) => `- ${mark} 녹화 안 된 쿼리: ${m}`),
        ...overflow.map((o) => `- ❌ 가로 넘침: ${o}`),
        ...overlap.map((o) => `- ⚠️ 글자 겹침: ${o}`),
        ...a11y.map((v) => `- ⚠️ 접근성 ${v.rule}: \`${v.target}\` ${v.summary}`),
        '',
      ];
      mkdirSync(join(OUT, 'parts'), { recursive: true });
      writeFileSync(
        join(OUT, 'parts', `${project}.${page.name}.${scenario}.md`),
        `${lines.join('\n')}\n`,
      );

      if (strict) {
        expect.soft(res?.status(), 'HTTP 상태').toBeLessThan(500);
        expect.soft(errors, '페이지 JS 오류').toEqual([]);
        expect.soft(boundary, '오류 경계').toBe(false);
        expect.soft(missing, '녹화 안 된 쿼리 — pnpm --filter web screens:record').toEqual([]);
      }
      expect.soft(overflow, '가로 넘침').toEqual([]);
    });
  }
}
